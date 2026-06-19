import { LucideIcon } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  suffix?: string
  icon: LucideIcon
  change?: string
  changePositive?: boolean
}

export function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  change,
  changePositive,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{title}</p>
        <Icon className="w-5 h-5 text-white/40" />
      </div>
      <p className="text-2xl font-bold mt-2">
        {formatNumber(value)}
        {suffix && <span className="text-sm text-white/40 ml-1">{suffix}</span>}
      </p>
      {change && (
        <p
          className={`text-xs mt-1 ${
            changePositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  )
}
