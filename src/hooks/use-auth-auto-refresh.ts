import { useEffect, useRef } from "react"
import { useAuthStore } from "../stores/authState"

/**
 * Setup a one-shot timer to proactively refresh access token before it expires.
 * Place this hook high in the tree (e.g. root layout) so it runs once.
 */
export function useAuthAutoRefresh(preRefreshSeconds: number = 60) {
  const expiresAt = useAuthStore((s) => s.expiresAt)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const isTokenExpired = useAuthStore((s) => s.isTokenExpired())
  const isRefreshExpired = useAuthStore((s) => s.isRefreshExpired())
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setAuth = useAuthStore((s) => s.setAuth)

  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // cleanup previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!expiresAt || !refreshToken) return
    if (isRefreshExpired) {
      clearAuth()
      return
    }

    const msUntilExpiry = expiresAt - Date.now()
    const fireIn = msUntilExpiry - preRefreshSeconds * 1000

    if (isTokenExpired) return

    const delay = fireIn <= 0 ? 0 : fireIn

    timeoutRef.current = window.setTimeout(async () => {
      // manual refresh using existing logic in axios util (fetch refresh endpoint)
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const resp = await fetch(`${backendUrl}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ refreshToken })
        })
        if (!resp.ok) throw new Error("refresh failed")
        const data: {
          accessToken: string
          refreshToken?: string
          accessTokenTtlSec?: number
          refreshTokenTtlSec?: number
        } = await resp.json()
        setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.accessTokenTtlSec,
          refreshExpiresIn: data.refreshTokenTtlSec
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
    refreshToken,
    isTokenExpired,
    isRefreshExpired,
    preRefreshSeconds,
    clearAuth,
    setAuth
  ])
}
