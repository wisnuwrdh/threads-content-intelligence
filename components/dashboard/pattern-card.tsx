"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Lightbulb, Zap } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface PatternInsight {
  topic: string
  insight: string
  direction: "up" | "down" | "neutral"
  metric: string
}

interface PatternCardProps {
  insights: PatternInsight[]
  wordCountImpact: Array<{
    range: string
    posts: number
    avgViews: number
    avgEngagement: number
  }>
  mediaPerformance: Array<{
    type: string
    posts: number
    avgViews: number
    avgEngagement: number
  }>
}

export function PatternCard({ insights, wordCountImpact, mediaPerformance }: PatternCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            What&apos;s Working
          </CardTitle>
          <CardDescription>Patterns from your content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">
              Generate more content to reveal patterns
            </p>
          ) : (
            insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 rounded-lg bg-white/5"
              >
                {insight.direction === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : insight.direction === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{insight.topic}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {insight.insight}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Length</CardTitle>
          <CardDescription>Words vs engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {wordCountImpact.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No data</p>
          ) : (
            <div className="space-y-2">
              {wordCountImpact
                .filter((w) => w.posts > 0)
                .map((w) => (
                  <div
                    key={w.range}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{w.range}</span>
                        <span className="text-white/30">
                          {w.posts} posts
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{
                            width: `${
                              Math.max(
                                ...wordCountImpact
                                  .filter((x) => x.posts > 0)
                                  .map((x) => x.avgViews)
                              )
                                ? (w.avgViews /
                                    Math.max(
                                      ...wordCountImpact
                                        .filter((x) => x.posts > 0)
                                        .map((x) => x.avgViews)
                                    )) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-white/40 ml-3 w-12 text-right">
                      {formatNumber(w.avgViews)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Media Performance</CardTitle>
          <CardDescription>Format comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {mediaPerformance.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No data</p>
          ) : (
            <div className="space-y-3">
              {mediaPerformance.map((m) => (
                <div key={m.type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60 capitalize">
                        {m.type}
                      </span>
                      <span className="text-white/30">{m.posts} posts</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{
                          width: `${
                            Math.max(...mediaPerformance.map((x) => x.avgViews))
                              ? (m.avgViews /
                                  Math.max(
                                    ...mediaPerformance.map((x) => x.avgViews)
                                  )) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-white/40 ml-3 w-12 text-right">
                    {formatNumber(m.avgViews)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
