import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  getPerformanceTimeline,
  getTopicBreakdown,
  getFunnelBreakdown,
  getPostingTimeAnalysis,
  getMediaPerformance,
  getWordCountAnalysis,
} from "@/lib/patterns"
import { PerfChart } from "@/components/dashboard/perf-chart"
import { TopicChart } from "@/components/dashboard/topic-chart"
import { PostingTime } from "@/components/dashboard/posting-time"
import { PatternCard } from "@/components/dashboard/pattern-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { formatNumber } from "@/lib/utils"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id

  const [
    performance,
    topics,
    funnel,
    postingTimes,
    media,
    wordCount,
  ] = await Promise.all([
    getPerformanceTimeline(userId, 30),
    getTopicBreakdown(userId),
    getFunnelBreakdown(userId),
    getPostingTimeAnalysis(userId),
    getMediaPerformance(userId),
    getWordCountAnalysis(userId),
  ])

  const totalViews = performance.reduce((s, d) => s + d.views, 0)
  const totalEngagement = performance.reduce(
    (s, d) => s + d.likes + d.replies + d.reposts,
    0
  )
  const avgEngRate =
    totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : "0"

  const patternInsights = [
    ...topics
      .filter((t) => t.posts >= 2)
      .slice(0, 2)
      .map((t) => ({
        topic: `"${t.topic}" performs well`,
        insight: `${formatNumber(t.totalViews)} views across ${t.posts} posts`,
        direction: "up" as const,
        metric: "views",
      })),
    ...(funnel.filter((f) => f.count > 0).length > 0
      ? [
          {
            topic: `Funnel focus: ${funnel.sort(
              (a, b) => b.avgViews - a.avgViews
            )[0]?.stage || "mixed"}`,
            insight: `${funnel.sort((a, b) => b.avgViews - a.avgViews)[0]?.stage} content drives highest avg views`,
            direction: "up" as const,
            metric: "views",
          },
        ]
      : []),
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-white/50">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatNumber(totalViews)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-white/50">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatNumber(totalEngagement)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-white/50">Avg. Eng. Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgEngRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Daily views and engagement (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <PerfChart data={performance} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Funnel Breakdown</CardTitle>
            <CardDescription>Views per funnel stage</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart
              tofu={funnel.find((f) => f.stage === "TOFU")?.count || 0}
              mofu={funnel.find((f) => f.stage === "MOFU")?.count || 0}
              bofu={funnel.find((f) => f.stage === "BOFU")?.count || 0}
              total={funnel.reduce((s, f) => s + f.count, 0)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Topics</CardTitle>
            <CardDescription>Topics with highest views</CardDescription>
          </CardHeader>
          <CardContent>
            <TopicChart data={topics} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <PostingTime data={postingTimes} />
      </div>

      <PatternCard
        insights={patternInsights}
        wordCountImpact={wordCount}
        mediaPerformance={media}
      />
    </div>
  )
}
