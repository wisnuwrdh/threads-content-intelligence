import { prisma } from "@/lib/db"

const THREADS_API_BASE = "https://graph.threads.net/v1.0"

interface ThreadsMedia {
  id: string
  media_type: string
  text?: string
  media_url?: string
  timestamp: string
  like_count?: number
  reply_count?: number
  repost_count?: number
  quote_count?: number
  view_count?: number
}

interface ThreadsInsights {
  data: Array<{
    name: string
    values: Array<{ value: number }>
  }>
}

export function getThreadsAuthUrl(): string {
  const clientId = process.env.THREADS_APP_ID
  const redirectUri = process.env.THREADS_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/threads/callback`

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    scope: "threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies",
    response_type: "code",
  })

  return `https://www.threads.net/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string
  userId: string
}> {
  const clientId = process.env.THREADS_APP_ID
  const clientSecret = process.env.THREADS_APP_SECRET
  const redirectUri = process.env.THREADS_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/threads/callback`

  const res = await fetch(`${THREADS_API_BASE}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    throw new Error(`Threads token exchange failed: ${await res.text()}`)
  }

  const data = await res.json()
  return { accessToken: data.access_token, userId: data.user_id }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${THREADS_API_BASE}/refresh_access_token`)
  url.searchParams.set("grant_type", "th_refresh_token")

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${refreshToken}` },
  })

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${await res.text()}`)
  }

  const data = await res.json()
  return { accessToken: data.access_token, expiresIn: data.expires_in || 5184000 }
}

function buildUrl(path: string, qs: Record<string, string>): string {
  const params = new URLSearchParams(qs)
  return `${THREADS_API_BASE}${path}?${params.toString()}`
}

export async function fetchUserThreads(
  accessToken: string,
  threadsUserId: string,
  limit = 25
): Promise<ThreadsMedia[]> {
  const res = await fetch(
    buildUrl(`/${threadsUserId}/threads`, {
      access_token: accessToken,
      fields: "id,media_type,text,media_url,timestamp,like_count,reply_count,repost_count,quote_count,view_count",
      limit: limit.toString(),
    })
  )

  if (!res.ok) {
    throw new Error(`Threads fetch failed: ${await res.text()}`)
  }

  const data = await res.json()
  return data.data || []
}

export async function fetchMediaInsights(
  accessToken: string,
  mediaId: string
): Promise<ThreadsInsights> {
  const res = await fetch(
    buildUrl(`/${mediaId}/insights`, {
      access_token: accessToken,
      metric: "likes,replies,reposts,quotes,views",
    })
  )

  if (!res.ok) {
    return { data: [] }
  }

  return res.json()
}

export async function syncThreadsPosts(
  accessToken: string,
  threadsUserId: string,
  appUserId: string
): Promise<number> {
  const threads = await fetchUserThreads(accessToken, threadsUserId)
  let synced = 0

  for (const thread of threads) {
    const existing = await prisma.post.findUnique({
      where: { threadId: thread.id },
    })

    if (existing) {
      await prisma.post.update({
        where: { threadId: thread.id },
        data: {
          views: thread.view_count || existing.views,
          likes: thread.like_count || existing.likes,
          replies: thread.reply_count || existing.replies,
          reposts: thread.repost_count || existing.reposts,
          quotes: thread.quote_count || existing.quotes,
          fetchedAt: new Date(),
        },
      })
    } else {
      await prisma.post.create({
        data: {
          threadId: thread.id,
          content: thread.text || "",
          mediaUrl: thread.media_url || null,
          mediaType: thread.media_type || null,
          postedAt: new Date(thread.timestamp),
          userId: appUserId,
          views: thread.view_count || 0,
          likes: thread.like_count || 0,
          replies: thread.reply_count || 0,
          reposts: thread.repost_count || 0,
          quotes: thread.quote_count || 0,
          wordCount: (thread.text || "").split(/\s+/).filter(Boolean).length,
        },
      })
    }
    synced++
  }

  await prisma.threadsConnection.updateMany({
    where: { threadsUserId, userId: appUserId },
    data: { lastFetchedAt: new Date() },
  })

  return synced
}
