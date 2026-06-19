import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { analyzePatterns, generateInsights, detectContentGaps } from "@/lib/sumopod"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const allPosts = await prisma.post.findMany({
      where: { userId },
      select: {
        content: true,
        views: true,
        likes: true,
        replies: true,
        reposts: true,
        funnelStage: true,
        wordCount: true,
        topic: true,
      },
      orderBy: { postedAt: "desc" },
      take: 50,
    })

    if (allPosts.length === 0) {
      return NextResponse.json(
        { error: "No posts to analyze yet. Connect Threads account first." },
        { status: 400 }
      )
    }

    const [patterns, funnelDist, topPerformer, topics] = await Promise.all([
      analyzePatterns(allPosts as any),
      prisma.post.groupBy({
        by: ["funnelStage"],
        where: { userId, funnelStage: { not: null } },
        _count: true,
      }).then((res) => ({
        TOFU: res.find((f) => f.funnelStage === "TOFU")?._count || 0,
        MOFU: res.find((f) => f.funnelStage === "MOFU")?._count || 0,
        BOFU: res.find((f) => f.funnelStage === "BOFU")?._count || 0,
      })),
      prisma.post.findFirst({
        where: { userId },
        orderBy: { views: "desc" },
        select: { content: true, views: true, likes: true },
      }),
      Array.from(new Set(allPosts.filter((p) => p.topic).map((p) => p.topic!))),
    ])

    const [insights, gaps] = await Promise.all([
      generateInsights({
        accountName: session.user.name || "User",
        totalPosts: allPosts.length,
        funnelDistribution: funnelDist,
        topPerformer: topPerformer || { content: "", views: 0, likes: 0 },
        patterns: patterns.patterns,
        lastWeekPosts: allPosts.filter(
          (p) =>
            new Date(p as any).getTime() > Date.now() - 7 * 86400000
        ).length,
      }),
      detectContentGaps({
        coveredTopics: topics,
        bestPerformingTopics: patterns.topTopics,
        funnelStages: funnelDist,
        totalPosts: allPosts.length,
      }),
    ])

    await Promise.all([
      prisma.contentPattern.upsert({
        where: {
          userId_patternType: { userId, patternType: "weekly" },
        },
        create: {
          userId,
          patternType: "weekly",
          data: JSON.stringify(patterns),
        },
        update: {
          data: JSON.stringify(patterns),
        },
      }),
      prisma.insight.create({
        data: {
          userId,
          type: "weekly_recap",
          title: `Weekly Content Brief - ${new Date().toLocaleDateString("id-ID")}`,
          content: insights.weeklySummary,
          metadata: JSON.stringify({
            contentBriefs: insights.contentBriefs,
            strategyTip: insights.strategyTip,
            gapWarning: insights.gapWarning,
          }),
        },
      }),
      prisma.insight.create({
        data: {
          userId,
          type: "content_gap",
          title: "Content Gap Analysis",
          content: `Found ${gaps.missingTopics.length} missing topics and ${gaps.nicheOpportunities.length} niche opportunities.`,
          metadata: JSON.stringify(gaps),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      insights: {
        weeklySummary: insights.weeklySummary,
        contentBriefs: insights.contentBriefs,
        strategyTip: insights.strategyTip,
        gapWarning: insights.gapWarning,
      },
      gaps,
      patterns: patterns.patterns,
    })
  } catch (error) {
    console.error("Insight generation failed:", error)
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    )
  }
}
