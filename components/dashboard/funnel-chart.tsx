interface FunnelChartProps {
  tofu: number
  mofu: number
  bofu: number
  total: number
}

export function FunnelChart({ tofu, mofu, bofu, total }: FunnelChartProps) {
  const tofuPct = total ? (tofu / total) * 100 : 0
  const mofuPct = total ? (mofu / total) * 100 : 0
  const bofuPct = total ? (bofu / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/80">Funnel Distribution</h3>
        <span className="text-xs text-white/40">{total} total posts</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-blue-400">TOFU</span>
            <span className="text-white/60">{tofu} ({tofuPct.toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${tofuPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-amber-400">MOFU</span>
            <span className="text-white/60">{mofu} ({mofuPct.toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${mofuPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-emerald-400">BOFU</span>
            <span className="text-white/60">{bofu} ({bofuPct.toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${bofuPct}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/40">
          <span>Ideal: 40-50%</span>
          <span>Ideal: 30-35%</span>
          <span>Ideal: 15-20%</span>
        </div>
      </div>
    </div>
  )
}
