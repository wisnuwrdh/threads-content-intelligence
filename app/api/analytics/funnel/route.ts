import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFunnelBreakdown } from "@/lib/patterns"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getFunnelBreakdown(session.user.id)
  return NextResponse.json(data)
}
