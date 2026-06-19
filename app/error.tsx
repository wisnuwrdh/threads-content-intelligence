"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="max-w-sm text-center p-8">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-white/50 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} variant="default">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}
