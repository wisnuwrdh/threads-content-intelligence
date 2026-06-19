import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { detectContentGaps } from "@/lib/sumopod"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const posts = await prisma.post.findMany({
    where: { userId },
    select: { topic: true, funnelStage: true, views: true },
    orderBy: { views: "desc" },
  })

  const topics = Array.from(
    new Set(posts.filter((p) => p.topic).map((p) => p.topic!))
  )

  const funnelDistribution = {
    TOFU: posts.filter((p) => p.funnelStage === "TOFU").length,
    MOFU: posts.filter((p) => p.funnelStage === "MOFU").length,
    BOFU: posts.filter((p) => p.funnelStage === "BOFU").length,
  }

  const topTopics = posts
    .filter((p) => p.topic)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((p) => p.topic!)

  const gaps = await detectContentGaps({
    coveredTopics: topics,
    bestPerformingTopics: topTopics,
    funnelStages: funnelDistribution,
    totalPosts: posts.length,
  })

  return NextResponse.json(gaps)
}
