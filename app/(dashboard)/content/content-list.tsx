"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatNumber } from "@/lib/utils"
import { Eye, Heart, MessageCircle, Repeat, Search, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"

interface Post {
  id: string
  threadId: string
  content: string
  postedAt: Date
  views: number
  likes: number
  replies: number
  reposts: number
  quotes: number
  funnelStage: string | null
  topic: string | null
  contentType: string | null
  wordCount: number | null
}

interface ContentListProps {
  posts: Post[]
  totalPosts: number
  page: number
  totalPages: number
  currentQuery: string
  currentFunnel: string
  currentSort: string
}

export function ContentList({
  posts,
  totalPosts,
  page,
  totalPages,
  currentQuery,
  currentFunnel,
  currentSort,
}: ContentListProps) {
  const router = useRouter()
  const [query, setQuery] = useState(currentQuery)

  const updateSearch = (updates: Record<string, string>) => {
    const sp = new URLSearchParams()
    const final = {
      q: currentQuery,
      funnel: currentFunnel,
      sort: currentSort,
      page: "1",
      ...updates,
    }
    Object.entries(final).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    router.push(`/content?${sp.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch({ q: query })
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </form>

        <select
          value={currentFunnel}
          onChange={(e) => updateSearch({ funnel: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="">All funnels</option>
          <option value="TOFU">TOFU</option>
          <option value="MOFU">MOFU</option>
          <option value="BOFU">BOFU</option>
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateSearch({ sort: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="date">Most recent</option>
          <option value="views">Most views</option>
          <option value="engagement">Most likes</option>
        </select>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">
            {currentQuery
              ? `No posts matching "${currentQuery}"`
              : "No posts yet"}
          </p>
          {currentQuery && (
            <Button
              variant="link"
              className="mt-2"
              onClick={() => updateSearch({ q: "", funnel: "", sort: "date" })}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {post.funnelStage && (
                    <Badge
                      variant={
                        post.funnelStage === "TOFU"
                          ? "tofu"
                          : post.funnelStage === "MOFU"
                          ? "mofu"
                          : "bofu"
                      }
                    >
                      {post.funnelStage}
                    </Badge>
                  )}
                  {post.topic && (
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                      {post.topic}
                    </span>
                  )}
                  {post.contentType && (
                    <span className="text-xs text-white/20">
                      {post.contentType}
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/30">
                  {formatDate(post.postedAt)}
                </span>
              </div>

              <p className="text-sm text-white/80 line-clamp-3 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center gap-5 mt-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {formatNumber(post.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {formatNumber(post.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {formatNumber(post.replies)}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5" />
                  {formatNumber(post.reposts)}
                </span>
                <span className="text-white/20 ml-auto">
                  {post.wordCount} words
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-white/30">
            Page {page} of {totalPages} ({totalPosts} posts)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={page <= 1}
              onClick={() => updateSearch({ page: String(page - 1) })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const p = start + i
              if (p > totalPages) return null
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateSearch({ page: String(p) })}
                  className="w-8 h-8"
                >
                  {p}
                </Button>
              )
            })}
            <Button
              variant="ghost"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => updateSearch({ page: String(page + 1) })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
