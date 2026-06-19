"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOUR_LABELS = [
  "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a",
  "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p",
  "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p",
]

interface PostingTimeData {
  day: number
  hour: number
  posts: number
  avgViews: number
  avgEngagement: number
}

interface PostingTimeProps {
  data: PostingTimeData[]
}

function getIntensity(views: number, maxViews: number): string {
  if (views === 0) return "bg-white/[0.03]"
  const ratio = views / maxViews
  if (ratio > 0.9) return "bg-emerald-500/80"
  if (ratio > 0.7) return "bg-emerald-500/60"
  if (ratio > 0.5) return "bg-emerald-500/40"
  if (ratio > 0.3) return "bg-emerald-500/25"
  if (ratio > 0.15) return "bg-emerald-500/15"
  return "bg-emerald-500/8"
}

function findBestTime(data: PostingTimeData[], metric: "avgViews" | "avgEngagement"): PostingTimeData | null {
  if (data.length === 0) return null
  return data.reduce((best, curr) =>
    curr[metric] > best[metric] ? curr : best
  )
}

export function PostingTime({ data }: PostingTimeProps) {
  const maxViews = Math.max(...data.map((d) => d.avgViews), 1)
  const bestView = findBestTime(data, "avgViews")
  const bestEngagement = findBestTime(data, "avgEngagement")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Best Posting Times</CardTitle>
          <CardDescription>Average views by day and hour</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-white/30 text-sm py-8 text-center">Not enough data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-[10px] text-white/30 p-1 w-10"></th>
                    {DAYS.map((d) => (
                      <th key={d} className="text-[10px] text-white/30 p-1 font-normal">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOUR_LABELS.map((hourLabel, hour) => (
                    <tr key={hour}>
                      <td className="text-[10px] text-white/20 pr-2 text-right">
                        {hourLabel}
                      </td>
                      {DAYS.map((_, day) => {
                        const cell = data.find(
                          (d) => d.day === day && d.hour === hour
                        )
                        const value = cell?.avgViews || 0
                        return (
                          <td
                            key={`${day}-${hour}`}
                            className={`p-1.5 text-center rounded ${getIntensity(
                              value,
                              maxViews
                            )}`}
                            title={
                              cell
                                ? `${DAYS[day]} ${hourLabel} — ${formatNumber(
                                    value
                                  )} avg views (${cell.posts} posts)`
                                : undefined
                            }
                          >
                            <span className="text-[10px] text-white/30">
                              {cell ? formatNumber(cell.avgViews) : ""}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Optimal posting windows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bestView && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-medium mb-1">
                Best for Views
              </p>
              <p className="text-sm font-semibold">
                {DAYS[bestView.day]}, {HOUR_LABELS[bestView.hour]}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {formatNumber(bestView.avgViews)} avg views ({bestView.posts} posts)
              </p>
            </div>
          )}
          {bestEngagement && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400 font-medium mb-1">
                Best for Engagement
              </p>
              <p className="text-sm font-semibold">
                {DAYS[bestEngagement.day]}, {HOUR_LABELS[bestEngagement.hour]}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {formatNumber(bestEngagement.avgEngagement)} avg engagement ({bestEngagement.posts} posts)
              </p>
            </div>
          )}
          <p className="text-[10px] text-white/20 leading-relaxed">
            Based on historical post data. Darker green = higher average views.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
