"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Copy, Clock, FileText, Share2 } from "lucide-react"
import { useState } from "react"

interface ContentBriefProps {
  briefs: Array<{
    funnelStage: string
    topic: string
    format: string
    hook: string
  }>
  onRefresh?: () => void
}

export function ContentBrief({ briefs, onRefresh }: ContentBriefProps) {
  const [copied, setCopied] = useState<number | null>(null)

  const copyBrief = (brief: typeof briefs[0], index: number) => {
    navigator.clipboard.writeText(
      `Topic: ${brief.topic}\nFunnel: ${brief.funnelStage}\nFormat: ${brief.format}\nHook: ${brief.hook}`
    )
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Content Briefs
            </CardTitle>
            <p className="text-xs text-white/40 mt-1">
              AI-generated content ideas for this week
            </p>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {briefs.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-4">
            No briefs yet. Generate insights to get started.
          </p>
        ) : (
          briefs.map((brief, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        brief.funnelStage === "TOFU"
                          ? "tofu"
                          : brief.funnelStage === "MOFU"
                          ? "mofu"
                          : "bofu"
                      }
                    >
                      {brief.funnelStage}
                    </Badge>
                    <span className="text-xs text-white/30">{brief.format}</span>
                  </div>
                  <p className="text-sm font-semibold">{brief.topic}</p>
                  <div className="p-3 rounded-md bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/60 italic">
                      &ldquo;{brief.hook}&rdquo;
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyBrief(brief, i)}
                >
                  {copied === i ? (
                    <span className="text-xs text-emerald-400">Copied!</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/30" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

interface ContentGapCardProps {
  gaps: {
    missingTopics: Array<{ topic: string; funnelStage: string; rationale: string }>
    underperformingStages: string[]
    nicheOpportunities: Array<{ topic: string; angle: string }>
  } | null
}

export function ContentGapCard({ gaps }: ContentGapCardProps) {
  if (!gaps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-sky-400" />
            Content Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/30 text-center py-4">
            Click &quot;Generate Insights&quot; to analyze content gaps
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-4 h-4 text-sky-400" />
          Content Gaps
        </CardTitle>
        <p className="text-xs text-white/40">
          Topics and stages you should cover
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {gaps.underperformingStages.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-400 font-medium mb-2">
              Underrepresented Funnel Stages
            </p>
            {gaps.underperformingStages.map((stage) => (
              <span key={stage} className="text-xs text-amber-200/80 block">
                {stage}
              </span>
            ))}
          </div>
        )}

        {gaps.missingTopics.length > 0 && (
          <div>
            <p className="text-xs text-white/40 font-medium mb-2">
              Missing Topics
            </p>
            <div className="space-y-2">
              {gaps.missingTopics.map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/5"
                >
                  <Badge
                    variant={
                      t.funnelStage === "TOFU"
                        ? "tofu"
                        : t.funnelStage === "MOFU"
                        ? "mofu"
                        : "bofu"
                    }
                  >
                    {t.funnelStage}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{t.topic}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {t.rationale}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gaps.nicheOpportunities.length > 0 && (
          <div>
            <p className="text-xs text-white/40 font-medium mb-2">
              Niche Opportunities
            </p>
            <div className="space-y-2">
              {gaps.nicheOpportunities.map((o, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-violet-500/5 border border-violet-500/10"
                >
                  <Share2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{o.topic}</p>
                    <p className="text-xs text-white/40 mt-0.5">{o.angle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface BriefSkeletonProps {
  funnelStage: string
  concept: string
  hook: string
  bodyOutline: string[]
  cta: string
  bestTimeToPost: string
}

export function DetailedBriefCard({ brief }: { brief: BriefSkeletonProps }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              brief.funnelStage === "TOFU"
                ? "tofu"
                : brief.funnelStage === "MOFU"
                ? "mofu"
                : "bofu"
            }
          >
            {brief.funnelStage}
          </Badge>
          <CardTitle className="text-base">{brief.concept}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <p className="text-xs text-amber-400 font-medium mb-1">Hook</p>
          <p className="text-sm text-white/80">{brief.hook}</p>
        </div>

        <div>
          <p className="text-xs text-white/40 font-medium mb-2">
            Body Outline
          </p>
          <ul className="space-y-1">
            {brief.bodyOutline.map((point, i) => (
              <li key={i} className="text-sm text-white/60 flex gap-2">
                <span className="text-white/20">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {brief.bestTimeToPost}
          </span>
          <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
            {brief.cta}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
