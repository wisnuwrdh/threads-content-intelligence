import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getThreadsAuthUrl } from "@/lib/threads"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const connections = await prisma.threadsConnection.findMany({
    where: { userId: session.user.id },
  })

  const threadsAuthUrl = getThreadsAuthUrl()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Threads Connection</CardTitle>
          <CardDescription>
            Connect your Threads account to sync and analyze content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <div className="space-y-3">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Connected account #{conn.threadsUserId.slice(-6)}
                    </p>
                    <p className="text-xs text-white/40">
                      Last synced: {conn.lastFetchedAt ? formatDate(conn.lastFetchedAt) : "Never"}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server"
                      await prisma.threadsConnection.delete({
                        where: { id: conn.id },
                      })
                      redirect("/settings")
                    }}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              ))}
              <a href={threadsAuthUrl}>
                <Button variant="outline" className="mt-2">
                  <Link2 className="w-4 h-4" />
                  Connect Another Account
                </Button>
              </a>
            </div>
          ) : (
            <div className="text-center py-6">
              <Link2 className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50 mb-4">
                No Threads account connected yet
              </p>
              <a href={threadsAuthUrl}>
                <Button>
                  <Link2 className="w-4 h-4" />
                  Connect Threads Account
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manual Content Input</CardTitle>
          <CardDescription>
            Add content manually if Threads API data is not available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server"
              const content = formData.get("content") as string
              const postedAt = formData.get("postedAt") as string
              const userId = session.user?.id
              if (!content || !userId) return

              await prisma.post.create({
                data: {
                  threadId: `manual_${Date.now()}`,
                  content,
                  isManual: true,
                  source: "manual",
                  postedAt: postedAt ? new Date(postedAt) : new Date(),
                  userId,
                  wordCount: content.split(/\s+/).filter(Boolean).length,
                },
              })
              redirect("/content")
            }}
            className="space-y-4"
          >
            <textarea
              name="content"
              rows={4}
              required
              placeholder="Paste your Threads content here..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-white/40 block mb-1">Posted Date</label>
                <input
                  type="date"
                  name="postedAt"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <Button type="submit">Add Content</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in as {session.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/30">
            Authentication managed via Google. Your data is stored securely in Turso.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
