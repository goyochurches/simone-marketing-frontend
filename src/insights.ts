export interface PostInsight {
  id: string
  caption: string
  mediaType: string
  productType: string
  timestamp: string
  likeCount: number
  commentsCount: number
  engagement: number
  permalink: string
  thumbnailUrl?: string
}

export interface FormatBreakdown {
  type: string
  count: number
  avgEngagement: number
}

export interface InsightsSummary {
  posts: PostInsight[]
  byFormat: FormatBreakdown[]
  avgEngagement: number
  avgLikes: number
  avgComments: number
}
