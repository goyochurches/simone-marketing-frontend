import { useApi } from './useApi'

export interface AuthSession {
  authenticated: boolean
}

export function useAuthSession() {
  return useApi<AuthSession>('/api/auth/session')
}
