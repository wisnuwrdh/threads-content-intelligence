"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { formatNumber } from "@/lib/utils"

interface TopicChartProps {
  data: Array<{
    topic: string
    totalViews: number
    totalEngagement: number
    posts: number
  }>
}

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#e879f9"]

export function TopicChart({ data }: TopicChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No topic data yet
      </div>
    )
  }

  const top = data.slice(0, 8)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={top} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          type="number"
          stroke="rgba(255,255,255,0.3)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          tickFormatter={(v: number) => formatNumber(v)}
        />
        <YAxis
          type="category"
          dataKey="topic"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: any) => [formatNumber(value as number), ""]}
        />
        <Bar dataKey="totalViews" radius={[0, 4, 4, 0]}>
          {top.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
