"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { formatNumber } from "@/lib/utils"

interface PerfChartProps {
  data: Array<{
    date: string
    views: number
    likes: number
    replies: number
    reposts: number
  }>
}

export function PerfChart({ data }: PerfChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No performance data yet
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.3)"
          tick={{ fontSize: 11 }}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          tickFormatter={(v: number) => formatNumber(v)}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          name="Views"
        />
        <Line
          type="monotone"
          dataKey="likes"
          stroke="#f43f5e"
          strokeWidth={2}
          dot={false}
          name="Likes"
        />
        <Line
          type="monotone"
          dataKey="replies"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Replies"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
