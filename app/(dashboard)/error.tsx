"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center py-20">
      <div className="max-w-sm text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-white/50 mb-6">
          {error.message || "Could not load this page. Try refreshing."}
        </p>
        <Button onClick={reset} variant="default" size="sm">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}
