import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getTopicBreakdown } from "@/lib/patterns"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getTopicBreakdown(session.user.id)
  return NextResponse.json(data.slice(0, 10))
}
