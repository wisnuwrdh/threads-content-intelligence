import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ContentList } from "./content-list"

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; funnel?: string; page?: string; sort?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const query = params.q || ""
  const funnelFilter = params.funnel || ""
  const sort = params.sort || "date"
  const page = parseInt(params.page || "1")
  const perPage = 15

  const where: any = { userId: session.user.id }
  if (query) {
    where.content = { contains: query }
  }
  if (funnelFilter) {
    where.funnelStage = funnelFilter
  }

  const [totalPosts, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: sort === "views"
        ? { views: "desc" }
        : sort === "engagement"
        ? { likes: "desc" }
        : { postedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ])

  const totalPages = Math.ceil(totalPosts / perPage)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-white/50 text-sm mt-1">
            {totalPosts} posts synced
          </p>
        </div>
      </div>

      <ContentList
        posts={posts}
        totalPosts={totalPosts}
        page={page}
        totalPages={totalPages}
        currentQuery={query}
        currentFunnel={funnelFilter}
        currentSort={sort}
      />
    </div>
  )
}
