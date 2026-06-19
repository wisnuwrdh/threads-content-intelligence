import { prisma } from "@/lib/db"

export interface PerformanceDataPoint {
  date: string
  views: number
  likes: number
  replies: number
  reposts: number
  posts: number
}

export interface TopicBreakdown {
  topic: string
  posts: number
  totalViews: number
  totalEngagement: number
  avgEngagementRate: number
}

export interface PostingTimeData {
  day: number
  hour: number
  posts: number
  avgViews: number
  avgEngagement: number
}

export interface FunnelBreakdown {
  stage: string
  count: number
  avgViews: number
  avgEngagement: number
  percentage: number
}

export interface WordCountImpact {
  range: string
  posts: number
  avgViews: number
  avgEngagement: number
}

export interface MediaPerformance {
  type: string
  posts: number
  avgViews: number
  avgEngagement: number
}

export async function getPerformanceTimeline(
  userId: string,
  days = 30
): Promise<PerformanceDataPoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const posts = await prisma.post.findMany({
    where: {
      userId,
      postedAt: { gte: since },
    },
    select: {
      postedAt: true,
      views: true,
      likes: true,
      replies: true,
      reposts: true,
    },
    orderBy: { postedAt: "asc" },
  })

  const dailyMap = new Map<string, PerformanceDataPoint>()

  for (const post of posts) {
    const dateKey = post.postedAt.toISOString().split("T")[0]
    const existing = dailyMap.get(dateKey) || {
      date: dateKey,
      views: 0,
      likes: 0,
      replies: 0,
      reposts: 0,
      posts: 0,
    }
    existing.views += post.views
    existing.likes += post.likes
    existing.replies += post.replies
    existing.reposts += post.reposts
    existing.posts += 1
    dailyMap.set(dateKey, existing)
  }

  return Array.from(dailyMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  )
}

export async function getTopicBreakdown(
  userId: string
): Promise<TopicBreakdown[]> {
  const posts = await prisma.post.findMany({
    where: {
      userId,
      topic: { not: null },
    },
    select: {
      topic: true,
      views: true,
      likes: true,
      replies: true,
      reposts: true,
    },
  })

  const topicMap = new Map<string, TopicBreakdown>()

  for (const post of posts) {
    const key = post.topic || "Untagged"
    const existing = topicMap.get(key) || {
      topic: key,
      posts: 0,
      totalViews: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
    }
    existing.posts += 1
    existing.totalViews += post.views
    existing.totalEngagement += post.likes + post.replies + post.reposts
    if (existing.totalViews > 0) {
      existing.avgEngagementRate =
        (existing.totalEngagement / existing.totalViews) * 100
    }
    topicMap.set(key, existing)
  }

  return Array.from(topicMap.values()).sort(
    (a, b) => b.totalViews - a.totalViews
  )
}

export async function getFunnelBreakdown(
  userId: string
): Promise<FunnelBreakdown[]> {
  const posts = await prisma.post.findMany({
    where: {
      userId,
      funnelStage: { not: null },
    },
    select: {
      funnelStage: true,
      views: true,
      likes: true,
      replies: true,
      reposts: true,
    },
  })

  const total = posts.length
  const stageMap = new Map<string, { views: number; engagement: number; count: number }>()

  for (const post of posts) {
    const key = post.funnelStage || "Unknown"
    const existing = stageMap.get(key) || { views: 0, engagement: 0, count: 0 }
    existing.count += 1
    existing.views += post.views
    existing.engagement += post.likes + post.replies + post.reposts
    stageMap.set(key, existing)
  }

  return ["TOFU", "MOFU", "BOFU"].map((stage) => {
    const d = stageMap.get(stage) || { views: 0, engagement: 0, count: 0 }
    return {
      stage,
      count: d.count,
      avgViews: d.count > 0 ? Math.round(d.views / d.count) : 0,
      avgEngagement: d.count > 0 ? Math.round(d.engagement / d.count) : 0,
      percentage: total > 0 ? (d.count / total) * 100 : 0,
    }
  })
}

export async function getPostingTimeAnalysis(
  userId: string
): Promise<PostingTimeData[]> {
  const posts = await prisma.post.findMany({
    where: { userId },
    select: {
      postedAt: true,
      views: true,
      likes: true,
      replies: true,
      reposts: true,
    },
  })

  const heatmap = new Map<string, PostingTimeData>()

  for (const post of posts) {
    const d = new Date(post.postedAt)
    const key = `${d.getDay()}-${d.getHours()}`
    const existing = heatmap.get(key) || {
      day: d.getDay(),
      hour: d.getHours(),
      posts: 0,
      avgViews: 0,
      avgEngagement: 0,
    }
    const engagement = post.likes + post.replies + post.reposts
    const totalPosts = existing.posts + 1
    existing.avgViews =
      (existing.avgViews * existing.posts + post.views) / totalPosts
    existing.avgEngagement =
      (existing.avgEngagement * existing.posts + engagement) / totalPosts
    existing.posts = totalPosts
    heatmap.set(key, existing)
  }

  return Array.from(heatmap.values())
}

export async function getMediaPerformance(
  userId: string
): Promise<MediaPerformance[]> {
  const posts = await prisma.post.findMany({
    where: {
      userId,
      mediaType: { not: null },
    },
    select: {
      mediaType: true,
      views: true,
      likes: true,
      replies: true,
      reposts: true,
    },
  })

  const mediaMap = new Map<string, { posts: number; views: number; engagement: number }>()

  for (const post of posts) {
    const key = post.mediaType || "text"
    const existing = mediaMap.get(key) || { posts: 0, views: 0, engagement: 0 }
    existing.posts += 1
    existing.views += post.views
    existing.engagement += post.likes + post.replies + post.reposts
    mediaMap.set(key, existing)
  }

  return Array.from(mediaMap.entries()).map(([type, d]) => ({
    type,
    posts: d.posts,
    avgViews: Math.round(d.views / d.posts),
    avgEngagement: Math.round(d.engagement / d.posts),
  }))
}

export async function getWordCountAnalysis(
  userId: string
): Promise<WordCountImpact[]> {
  const posts = await prisma.post.findMany({
    where: {
      userId,
      wordCount: { not: null },
    },
    select: {
      wordCount: true,
      views: true,
      likes: true,
      replies: true,
      reposts: true,
    },
  })

  const ranges = [
    { label: "0-50", min: 0, max: 50 },
    { label: "51-100", min: 51, max: 100 },
    { label: "101-200", min: 101, max: 200 },
    { label: "201-350", min: 201, max: 350 },
    { label: "350+", min: 351, max: Infinity },
  ]

  return ranges.map(({ label, min, max }) => {
    const filtered = posts.filter(
      (p) => p.wordCount! >= min && p.wordCount! <= max
    )
    const views = filtered.reduce((s, p) => s + p.views, 0)
    const engagement = filtered.reduce(
      (s, p) => s + p.likes + p.replies + p.reposts,
      0
    )
    return {
      range: label,
      posts: filtered.length,
      avgViews: filtered.length > 0 ? Math.round(views / filtered.length) : 0,
      avgEngagement:
        filtered.length > 0 ? Math.round(engagement / filtered.length) : 0,
    }
  })
}
