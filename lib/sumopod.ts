import OpenAI from "openai"

let _sumopod: OpenAI | null = null

function getSumoPod(): OpenAI {
  if (!_sumopod) {
    _sumopod = new OpenAI({
      apiKey: process.env.SUMOPOD_API_KEY,
      baseURL: "https://ai.sumopod.com/v1",
    })
  }
  return _sumopod
}

export const MODELS = {
  classify: "gemini-2.5-flash",
  analyze: "gpt-4o-mini",
  insight: "claude-sonnet-4-6",
} as const

export async function classifyFunnel(content: string): Promise<{
  funnelStage: "TOFU" | "MOFU" | "BOFU"
  contentType: string
  topic: string
  tone: string
  reasoning: string
}> {
  const res = await getSumoPod().chat.completions.create({
    model: MODELS.classify,
    messages: [
      {
        role: "system",
        content: `You are a digital marketing content analyst. Classify Threads social media content into marketing funnel stages.

TOFU (Top of Funnel - Awareness):
- Educational basics, industry tips, relatable stories, hot takes, opinions
- Goal: Attract new audience, maximize reach, brand discovery
- Low commitment, high curiosity

MOFU (Middle of Funnel - Consideration):
- Deeper tutorials, comparisons, case studies, social proof
- Goal: Build trust, deepen engagement, showcase expertise
- Medium commitment, demonstrating value

BOFU (Bottom of Funnel - Conversion):
- Testimonials, specific offers, direct CTAs, product demos
- Goal: Drive action (clicks, signups, purchases)
- High intent, clear next step

Return JSON with:
- funnelStage: "TOFU" | "MOFU" | "BOFU"
- contentType: opinion | educational | story | tutorial | comparison | testimonial | promotional | personal | news | entertainment
- topic: short topic keyword (max 3 words)
- tone: casual | professional | inspirational | humorous | urgent | empathetic
- reasoning: brief explanation (max 1 sentence)`,
      },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 300,
  })

  return JSON.parse(
    res.choices[0]?.message?.content || "{}"
  )
}

export async function analyzePatterns(posts: Array<{ content: string; views: number; likes: number; replies: number; reposts: number; funnelStage: string; wordCount: number }>): Promise<{
  patterns: string[]
  peakEngagement: string
  topTopics: string[]
  recommendations: string[]
}> {
  const res = await getSumoPod().chat.completions.create({
    model: MODELS.analyze,
    messages: [
      {
        role: "system",
        content: `You are a content pattern analyst. Analyze the given social media content performance data and identify patterns. Return JSON with:
- patterns: list of 3-5 insights about what content works best (format, style, timing hints)
- peakEngagement: what correlates with highest engagement
- topTopics: top 3 topics that perform best
- recommendations: 3 actionable recommendations for future content`,
      },
      {
        role: "user",
        content: JSON.stringify(posts),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 600,
  })

  return JSON.parse(
    res.choices[0]?.message?.content || "{}"
  )
}

export async function generateInsights(context: {
  accountName: string
  totalPosts: number
  funnelDistribution: { TOFU: number; MOFU: number; BOFU: number }
  topPerformer: { content: string; views: number; likes: number }
  patterns: string[]
  lastWeekPosts: number
}): Promise<{
  weeklySummary: string
  contentBriefs: Array<{ funnelStage: string; topic: string; format: string; hook: string }>
  strategyTip: string
  gapWarning: string | null
}> {
  const res = await getSumoPod().chat.completions.create({
    model: MODELS.insight,
    messages: [
      {
        role: "system",
        content: `You are a content strategist specializing in organic social media growth. Analyze the account data and provide actionable insights. Return JSON with:
- weeklySummary: 2-3 sentence summary of performance
- contentBriefs: 3 content ideas, each with funnelStage ("TOFU"/"MOFU"/"BOFU"), topic, format, and hook
- strategyTip: one strategic recommendation
- gapWarning: null or a warning if funnel is unbalanced (e.g., terlalu banyak TOFU, kurang BOFU)`,
      },
      {
        role: "user",
        content: JSON.stringify(context),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 800,
  })

  return JSON.parse(
    res.choices[0]?.message?.content || "{}"
  )
}

export async function detectContentGaps(context: {
  coveredTopics: string[]
  bestPerformingTopics: string[]
  funnelStages: { TOFU: number; MOFU: number; BOFU: number }
  totalPosts: number
}): Promise<{
  missingTopics: Array<{ topic: string; funnelStage: string; rationale: string }>
  underperformingStages: string[]
  nicheOpportunities: Array<{ topic: string; angle: string }>
}> {
  const res = await getSumoPod().chat.completions.create({
    model: MODELS.insight,
    messages: [
      {
        role: "system",
        content: `You are a content strategist analyzing a Threads social media account. Find content gaps and opportunities. Return JSON with:
- missingTopics: list of topics the user hasn't covered but should, each with { topic, funnelStage ("TOFU"/"MOFU"/"BOFU"), rationale }
- underperformingStages: list of funnel stages that are underrepresented (compare against ideal: TOFU 40-50%, MOFU 30-35%, BOFU 15-20%). Return empty array if balanced.
- nicheOpportunities: 2-3 specific, creative angles the user hasn't explored that could differentiate them`,
      },
      {
        role: "user",
        content: JSON.stringify(context),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 600,
  })

  return JSON.parse(
    res.choices[0]?.message?.content || "{}"
  )
}

export async function generateContentBrief(prompt: {
  funnelStage: string
  audienceContext: string
  bestTopics: string[]
  format?: string
}): Promise<{
  concept: string
  hook: string
  bodyOutline: string[]
  cta: string
  estimatedWordCount: number
  bestTimeToPost: string
}> {
  const res = await getSumoPod().chat.completions.create({
    model: MODELS.insight,
    messages: [
      {
        role: "system",
        content: `You are an expert Threads content creator. Write a detailed content brief for a Threads post. Return JSON with:
- concept: one-line content concept
- hook: attention-grabbing first sentence (max 100 chars)
- bodyOutline: 3-4 bullet points for the body
- cta: suggested call-to-action (max 80 chars)
- estimatedWordCount: number
- bestTimeToPost: suggested posting time based on common Threads patterns`,
      },
      {
        role: "user",
        content: JSON.stringify(prompt),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 500,
  })

  return JSON.parse(
    res.choices[0]?.message?.content || "{}"
  )
}
