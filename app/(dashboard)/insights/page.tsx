import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ContentBrief, ContentGapCard } from "@/components/dashboard/content-brief"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, AlertTriangle, TrendingUp, Target, Sparkles } from "lucide-react"
import { formatDate } from "@/lib/utils"

const insightIcons: Record<string, typeof Lightbulb> = {
  weekly_recap: TrendingUp,
  content_gap: AlertTriangle,
  pattern: Target,
  recommendation: Lightbulb,
}

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id

  const [insights, lastWeeklyInsight, posts] = await Promise.all([
    prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.insight.findFirst({
      where: { userId, type: "weekly_recap" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({ where: { userId } }),
  ])

  const weeklyBriefs = lastWeeklyInsight?.metadata
    ? (() => {
        try {
          return JSON.parse(lastWeeklyInsight.metadata).contentBriefs || []
        } catch {
          return []
        }
      })()
    : []

  const lastGapInsight = insights.find((i) => i.type === "content_gap")
  const gapData = lastGapInsight?.metadata
    ? (() => {
        try {
          return JSON.parse(lastGapInsight.metadata)
        } catch {
          return null
        }
      })()
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-white/50 text-sm mt-1">
            Content recommendations & strategy powered by SumoPod
          </p>
        </div>
        {posts > 0 && (
          <form
            action={async () => {
              "use server"
              await fetch(
                `${process.env.NEXTAUTH_URL}/api/insights/generate`,
                { method: "POST" }
              )
            }}
          >
            <Button type="submit" variant="default">
              <Sparkles className="w-4 h-4" />
              Generate Insights
            </Button>
          </form>
        )}
      </div>

      {posts === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lightbulb className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">
                Connect your Threads account first to start getting AI insights.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ContentBrief briefs={weeklyBriefs} />
            <ContentGapCard gaps={gapData} />
          </div>

          <h2 className="text-lg font-semibold mb-4 mt-8">Insights History</h2>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-4">
                No insights yet. Click &quot;Generate Insights&quot; above.
              </p>
            ) : (
              insights.map((insight) => {
                const Icon = insightIcons[insight.type] || Lightbulb
                let briefs = null
                try {
                  const meta = JSON.parse(insight.metadata || "{}")
                  briefs = meta.contentBriefs
                } catch {}

                return (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-amber-400" />
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/70">{insight.content}</p>
                      {briefs && (
                        <div className="mt-4 space-y-2">
                          {briefs.map((b: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                            >
                              <Badge
                                variant={
                                  b.funnelStage === "TOFU"
                                    ? "tofu"
                                    : b.funnelStage === "MOFU"
                                    ? "mofu"
                                    : "bofu"
                                }
                              >
                                {b.funnelStage}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium">{b.topic}</p>
                                <p className="text-xs text-white/50 mt-0.5">
                                  {b.hook}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-white/30 mt-4">
                        {formatDate(insight.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
