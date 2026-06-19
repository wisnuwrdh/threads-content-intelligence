import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPostingTimeAnalysis, getMediaPerformance, getWordCountAnalysis } from "@/lib/patterns"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [postingTimes, media, wordCount] = await Promise.all([
    getPostingTimeAnalysis(session.user.id),
    getMediaPerformance(session.user.id),
    getWordCountAnalysis(session.user.id),
  ])

  return NextResponse.json({ postingTimes, media, wordCount })
}
