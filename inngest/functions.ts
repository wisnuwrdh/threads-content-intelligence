import { inngest } from "./client"
import { prisma } from "@/lib/db"
import { syncThreadsPosts } from "@/lib/threads"
import { classifyFunnel, analyzePatterns, generateInsights, detectContentGaps } from "@/lib/sumopod"

export const syncAndAnalyze = inngest.createFunction(
  {
    id: "sync-and-analyze",
    name: "Sync Threads & Analyze Content",
    triggers: [{ cron: "TZ=Asia/Jakarta */6 * * *" }],
  },
  async ({ step }) => {
    const connections = await step.run("get-connections", async () => {
      return prisma.threadsConnection.findMany({
        include: { user: true },
      })
    })

    for (const conn of connections) {
      const postsToAnalyze: string[] = []

      await step.run(`sync-threads-${conn.threadsUserId}`, async () => {
        try {
          const synced = await syncThreadsPosts(
            conn.accessToken,
            conn.threadsUserId,
            conn.userId
          )
          return { synced, connectionId: conn.id }
        } catch (e) {
          console.error(`Sync failed for ${conn.threadsUserId}:`, e)
          return { synced: 0, connectionId: conn.id }
        }
      })

      const unanalyzedPosts = await step.run(`find-unanalyzed-${conn.userId}`, async () => {
        const posts = await prisma.post.findMany({
          where: { userId: conn.userId, funnelStage: null },
          select: { id: true, content: true },
          take: 20,
        })
        return posts
      })

      for (const post of unanalyzedPosts) {
        await step.run(`classify-${post.id}`, async () => {
          try {
            const analysis = await classifyFunnel(post.content)
            await prisma.post.update({
              where: { id: post.id },
              data: {
                funnelStage: analysis.funnelStage,
                contentType: analysis.contentType,
                topic: analysis.topic,
                tone: analysis.tone,
                analyzedAt: new Date(),
              },
            })
          } catch (e) {
            console.error(`Classify failed for ${post.id}:`, e)
          }
        })
        postsToAnalyze.push(post.id)
      }

      if (postsToAnalyze.length > 0) {
        await step.run(`generate-insights-${conn.userId}`, async () => {
          const allPosts = await prisma.post.findMany({
            where: { userId: conn.userId },
            select: {
              content: true, views: true, likes: true, replies: true,
              reposts: true, funnelStage: true, wordCount: true, topic: true,
            },
            orderBy: { postedAt: "desc" },
            take: 50,
          })

          const patterns = await analyzePatterns(allPosts as any)

          await prisma.contentPattern.upsert({
            where: { userId_patternType: { userId: conn.userId, patternType: "weekly" } },
            create: {
              userId: conn.userId,
              patternType: "weekly",
              data: JSON.stringify(patterns),
            },
            update: {
              data: JSON.stringify(patterns),
            },
          })

          const funnelDist = await step.run(`get-distribution-${conn.userId}`, async () => {
            const posts = await prisma.post.findMany({
              where: { userId: conn.userId, funnelStage: { not: null } },
              select: { funnelStage: true },
            })
            return {
              TOFU: posts.filter(p => p.funnelStage === "TOFU").length,
              MOFU: posts.filter(p => p.funnelStage === "MOFU").length,
              BOFU: posts.filter(p => p.funnelStage === "BOFU").length,
            }
          })

          const topPerformer = await prisma.post.findFirst({
            where: { userId: conn.userId },
            orderBy: { views: "desc" },
            select: { content: true, views: true, likes: true },
          })

          const insights = await generateInsights({
            accountName: conn.user.name || "User",
            totalPosts: allPosts.length,
            funnelDistribution: funnelDist as any,
            topPerformer: topPerformer || { content: "", views: 0, likes: 0 },
            patterns: patterns.patterns,
            lastWeekPosts: allPosts.filter(
              p => new Date(p as any).getTime() > Date.now() - 7 * 86400000
            ).length,
          })

          await prisma.insight.create({
            data: {
              userId: conn.userId,
              type: "weekly_recap",
              title: `Weekly Content Brief - ${new Date().toLocaleDateString("id-ID")}`,
              content: insights.weeklySummary,
              metadata: JSON.stringify({
                contentBriefs: insights.contentBriefs,
                strategyTip: insights.strategyTip,
                gapWarning: insights.gapWarning,
              }),
            },
          })

          const allTopics = allPosts
            .filter((p) => p.topic)
            .map((p) => p.topic!)

          const gaps = await detectContentGaps({
            coveredTopics: Array.from(new Set(allTopics)),
            bestPerformingTopics: patterns.topTopics,
            funnelStages: funnelDist as any,
            totalPosts: allPosts.length,
          })

          await prisma.insight.create({
            data: {
              userId: conn.userId,
              type: "content_gap",
              title: "Content Gap Analysis",
              content: `Found ${gaps.missingTopics.length} missing topics and ${gaps.nicheOpportunities.length} niche opportunities.`,
              metadata: JSON.stringify(gaps),
            },
          })
        })
      }
    }

    return { processed: connections.length }
  }
)
