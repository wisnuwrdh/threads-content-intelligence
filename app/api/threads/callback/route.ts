import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { exchangeCodeForToken } from "@/lib/threads"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings?error=threads_auth_failed", request.url)
    )
  }

  const session = await auth()
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { accessToken, userId: threadsUserId } = await exchangeCodeForToken(code)

    await prisma.threadsConnection.upsert({
      where: {
        userId_threadsUserId: {
          userId: session.user.id!,
          threadsUserId,
        },
      },
      create: {
        userId: session.user.id!,
        threadsUserId,
        accessToken,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      update: {
        accessToken,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.redirect(new URL("/settings?connected=true", request.url))
  } catch (e) {
    console.error("Threads OAuth error:", e)
    return NextResponse.redirect(
      new URL("/settings?error=token_exchange_failed", request.url)
    )
  }
}
