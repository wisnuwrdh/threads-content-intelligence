import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StatCard } from "@/components/dashboard/stat-card"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, MessageCircle, Repeat, Lightbulb, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate, formatNumber } from "@/lib/utils"
import { getFunnelBreakdown, getTopicBreakdown, getPerformanceTimeline } from "@/lib/patterns"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id

  const [
    totalPosts,
    totalViewsAgg,
    metricsAgg,
    funnelCounts,
    latestInsight,
    performance,
    topics,
    funnel,
  ] = await Promise.all([
    prisma.post.count({ where: { userId } }),
    prisma.post.aggregate({
      where: { userId },
      _sum: { views: true },
    }),
    prisma.post.aggregate({
      where: { userId },
      _sum: { likes: true, replies: true, reposts: true },
    }),
    prisma.post.groupBy({
      by: ["funnelStage"],
      where: { userId, funnelStage: { not: null } },
      _count: true,
    }),
    prisma.insight.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    getPerformanceTimeline(userId, 14),
    getTopicBreakdown(userId),
    getFunnelBreakdown(userId),
  ])

  const tofu = funnelCounts.find((f) => f.funnelStage === "TOFU")?._count || 0
  const mofu = funnelCounts.find((f) => f.funnelStage === "MOFU")?._count || 0
  const bofu = funnelCounts.find((f) => f.funnelStage === "BOFU")?._count || 0

  const totalViews = totalViewsAgg._sum.views || 0
  const totalLikes = metricsAgg._sum.likes || 0
  const totalReplies = metricsAgg._sum.replies || 0
  const totalReposts = metricsAgg._sum.reposts || 0

  const engagementChange =
    performance.length >= 2
      ? (() => {
          const last7days = performance.slice(-7)
          const prev7days = performance.slice(-14, -7)
          const lastAvg =
            last7days.reduce((s, d) => s + d.likes + d.replies + d.reposts, 0) /
            Math.max(last7days.length, 1)
          const prevAvg =
            prev7days.reduce(
              (s, d) => s + d.likes + d.replies + d.reposts,
              0
            ) / Math.max(prev7days.length, 1)
          if (prevAvg === 0) return null
          const pct = (((lastAvg - prevAvg) / prevAvg) * 100).toFixed(0)
          return `${parseInt(pct) >= 0 ? "+" : ""}${pct}% vs last week`
        })()
      : null

  const topTopic = topics.length > 0 ? topics[0].topic : null
  const tofuWarning =
    funnel.length > 0 && funnel.find((f) => f.stage === "TOFU")?.percentage
      ? (funnel.find((f) => f.stage === "TOFU")?.percentage || 0) > 60
      : false
  const bofuWarning =
    funnel.length > 0 && funnel.find((f) => f.stage === "BOFU")?.percentage
      ? (funnel.find((f) => f.stage === "BOFU")?.percentage || 0) < 10 &&
        totalPosts > 10
      : false

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-white/50 mt-1">Here&apos;s your content overview</p>
        </div>
        <div className="flex items-center gap-3">
          {topTopic && (
            <div className="text-right">
              <p className="text-xs text-white/30">Top topic</p>
              <p className="text-sm font-medium text-white/70">{topTopic}</p>
            </div>
          )}
          {totalPosts > 0 && (
            <form
              action={async () => {
                "use server"
                await fetch(
                  `${process.env.NEXTAUTH_URL}/api/insights/generate`,
                  { method: "POST" }
                )
              }}
            >
              <Button type="submit" variant="default" size="sm">
                <Sparkles className="w-4 h-4" />
                Generate Insight
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Posts" value={totalPosts} icon={TrendingUp} />
        <StatCard
          title="Total Views"
          value={totalViews}
          icon={Eye}
        />
        <StatCard
          title="Likes"
          value={totalLikes}
          icon={Heart}
          change={engagementChange || undefined}
          changePositive={engagementChange ? !engagementChange.startsWith("-") : undefined}
        />
        <StatCard
          title="Replies + Reposts"
          value={totalReplies + totalReposts}
          icon={MessageCircle}
        />
      </div>

      {(tofuWarning || bofuWarning) && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Funnel Balance Alert</p>
            <p className="text-xs text-amber-200/70 mt-1">
              {tofuWarning && "TOFU content is over 60% — try adding more MOFU/BOFU for a balanced funnel. "}
              {bofuWarning && "BOFU is under 10% — consider adding testimonial or CTA content to drive conversions."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardContent>
            <FunnelChart
              tofu={tofu}
              mofu={mofu}
              bofu={bofu}
              total={tofu + mofu + bofu}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest AI Insight</CardTitle>
            <CardDescription>
              Generated by SumoPod — Claude Sonnet 4.6
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestInsight ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium">{latestInsight.title}</span>
                </div>
                <p className="text-sm text-white/70">{latestInsight.content}</p>
                {latestInsight.metadata && (
                  <div className="mt-4 space-y-2">
                    {(() => {
                      try {
                        const meta = JSON.parse(latestInsight.metadata)
                        return (
                          <>
                            {meta.contentBriefs?.map(
                              (brief: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                                >
                                  <Badge
                                    variant={
                                      brief.funnelStage === "TOFU"
                                        ? "tofu"
                                        : brief.funnelStage === "MOFU"
                                        ? "mofu"
                                        : "bofu"
                                    }
                                  >
                                    {brief.funnelStage}
                                  </Badge>
                                  <div className="text-sm">
                                    <p className="font-medium">{brief.topic}</p>
                                    <p className="text-white/50 text-xs mt-0.5">
                                      {brief.hook}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                            {meta.strategyTip && (
                              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs text-amber-400 font-medium mb-1">
                                  Strategy Tip
                                </p>
                                <p className="text-xs text-amber-200/80">
                                  {meta.strategyTip}
                                </p>
                              </div>
                            )}
                            {meta.gapWarning && (
                              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-xs text-red-400 font-medium mb-1">
                                  Warning
                                </p>
                                <p className="text-xs text-red-200/80">
                                  {meta.gapWarning}
                                </p>
                              </div>
                            )}
                          </>
                        )
                      } catch {
                        return null
                      }
                    })()}
                  </div>
                )}
                <p className="text-xs text-white/30 mt-4">
                  {formatDate(latestInsight.createdAt)}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50">
                  Connect your Threads account to get AI-powered insights
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
