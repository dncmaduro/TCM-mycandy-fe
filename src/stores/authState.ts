import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Shape of user info you may receive from backend after Google OAuth
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface SetAuthArgs {
  accessToken: string
  refreshToken?: string
  // access token ttl seconds
  expiresIn?: number
  // refresh token ttl seconds
  refreshExpiresIn?: number
  user?: AuthUser
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  // Epoch ms when access token expires
  expiresAt: number | null
  // Epoch ms when refresh token expires
  refreshExpiresAt: number | null
  user: AuthUser | null
  setAuth: (data: SetAuthArgs) => void
  updateUser: (data: Partial<AuthUser>) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  isTokenExpired: () => boolean
  isRefreshExpired: () => boolean
}

// Helper to compute expiry timestamp
const computeExpiresAt = (expiresIn?: number) => {
  if (!expiresIn || expiresIn <= 0) return null
  return Date.now() + expiresIn * 1000 - 5_000 // subtract small buffer
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      refreshExpiresAt: null,
      user: null,
      setAuth: ({
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn,
        user
      }) => {
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          // preserve previous if not provided (e.g. partial update)
          expiresAt: computeExpiresAt(expiresIn) ?? get().expiresAt,
          refreshExpiresAt:
            computeExpiresAt(refreshExpiresIn) ?? get().refreshExpiresAt,
          user: user ?? get().user
        })
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...data }
            : { ...(data as AuthUser) }
        })),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          refreshExpiresAt: null,
          user: null
        }),
      isAuthenticated: () => {
        const { accessToken, isTokenExpired } = get()
        if (!accessToken) return false
        if (isTokenExpired()) return false
        return true
      },
      isTokenExpired: () => {
        const { expiresAt } = get()
        if (!expiresAt) return false
        return Date.now() >= expiresAt
      },
      isRefreshExpired: () => {
        const { refreshExpiresAt } = get()
        if (!refreshExpiresAt) return false
        return Date.now() >= refreshExpiresAt
      }
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        refreshExpiresAt: state.refreshExpiresAt,
        user: state.user
      })
    }
  )
)

// Optional helper to safely access current valid access token
export const getValidAccessToken = () => {
  const { accessToken, isTokenExpired, clearAuth } = useAuthStore.getState()
  if (!accessToken) return null
  if (isTokenExpired()) {
    clearAuth()
    return null
  }
  return accessToken
}

// Example usage:
// const { setAuth, isAuthenticated, user } = useAuthStore()
// if (isAuthenticated()) { /* ... */ }
