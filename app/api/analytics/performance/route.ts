import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPerformanceTimeline } from "@/lib/patterns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") || "30")

  const data = await getPerformanceTimeline(session.user.id, days)
  return NextResponse.json(data)
}
