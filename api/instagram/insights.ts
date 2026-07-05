import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igGet, NotConnectedError } from '../_lib/instagram.js'
import { requireAuth } from '../_lib/auth.js'
import type { PostInsight, FormatBreakdown, InsightsSummary } from '../../src/insights'

function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
}

function buildSummary(posts: PostInsight[]): InsightsSummary {
  const byFormatMap = new Map<string, number[]>()
  for (const p of posts) {
    const list = byFormatMap.get(p.productType) ?? []
    list.push(p.engagement)
    byFormatMap.set(p.productType, list)
  }
  const byFormat: FormatBreakdown[] = [...byFormatMap.entries()]
    .map(([type, values]) => ({ type, count: values.length, avgEngagement: average(values) }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)

  return {
    posts,
    byFormat,
    avgEngagement: average(posts.map(p => p.engagement)),
    avgLikes: average(posts.map(p => p.likeCount)),
    avgComments: average(posts.map(p => p.commentsCount)),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  try {
    const token = await getValidToken()
    const media = await igGet('/me/media', token.accessToken, {
      fields: 'id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink,thumbnail_url,media_url',
      limit: '50',
    })

    const posts: PostInsight[] = (media.data ?? []).map((m: any) => ({
      id: m.id,
      caption: m.caption ?? '',
      mediaType: m.media_type,
      productType: m.media_product_type ?? m.media_type,
      timestamp: m.timestamp,
      likeCount: m.like_count ?? 0,
      commentsCount: m.comments_count ?? 0,
      engagement: (m.like_count ?? 0) + (m.comments_count ?? 0),
      permalink: m.permalink,
      thumbnailUrl: m.thumbnail_url ?? (m.media_type === 'IMAGE' ? m.media_url : undefined),
    }))

    res.status(200).json(buildSummary(posts))
  } catch (e) {
    if (e instanceof NotConnectedError) {
      res.status(200).json({ posts: [], byFormat: [], avgEngagement: 0, avgLikes: 0, avgComments: 0 })
      return
    }
    console.error('GET /api/instagram/insights failed', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
