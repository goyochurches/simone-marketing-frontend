import { useApi } from './useApi'

export interface InstagramStatus {
  connected: boolean
  expiresAt: number | null
}

export function useInstagramStatus() {
  return useApi<InstagramStatus>('/api/instagram/status')
}
