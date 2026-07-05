import { useApi } from './useApi'

export interface InstagramStatus {
  connected: boolean
  expiresAt: number | null
  handle?: string
  name?: string
  followers?: number
  posts?: number | null
  followersPerPost?: number | null
}

export function useInstagramStatus() {
  return useApi<InstagramStatus>('/api/instagram/status')
}
