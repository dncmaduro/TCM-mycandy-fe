import { useEffect, useRef } from "react"
import { useAuthStore } from "../stores/authState"
import { useAuth } from "./use-auth"

/**
 * Setup a one-shot timer to proactively refresh access token before it expires.
 * Place this hook high in the tree (e.g. root layout) so it runs once.
 */
export function useAuthAutoRefresh(preRefreshSeconds: number = 60) {
  const expiresAt = useAuthStore((s) => s.expiresAt)
  const refreshTokenValue = useAuthStore((s) => s.refreshToken)
  const isTokenExpired = useAuthStore((s) => s.isTokenExpired())
  const isRefreshExpired = useAuthStore((s) => s.isRefreshExpired())
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setAuth = useAuthStore((s) => s.setAuth)
  const { refreshToken } = useAuth()

  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // cleanup previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!expiresAt || !refreshTokenValue) return
    if (isRefreshExpired) {
      clearAuth()
      return
    }

    const msUntilExpiry = expiresAt - Date.now()
    const fireIn = msUntilExpiry - preRefreshSeconds * 1000

    if (isTokenExpired) return

    const delay = fireIn <= 0 ? 0 : fireIn

    timeoutRef.current = window.setTimeout(async () => {
      try {
        const resp = await refreshToken({ refreshToken: refreshTokenValue })
        const data = resp.data
        setAuth({
          accessToken: data.token,
          refreshToken: data.rt,
          expiresIn: data.tokenExp,
          refreshExpiresIn: data.rtExp
        })
      } catch (e) {
        clearAuth()
      }
    }, delay)

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [
    expiresAt,
    refreshTokenValue,
    isTokenExpired,
    isRefreshExpired,
    preRefreshSeconds,
    clearAuth,
    setAuth,
    refreshToken
  ])
}
