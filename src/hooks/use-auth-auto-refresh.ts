import { useEffect, useRef } from "react"
import { useAuthStore } from "../stores/authState"
import { useAuth } from "./use-auth"

/**
 * Periodically checks token validity and refreshes if needed.
 * Default interval: 30s.
 */
export function useAuthAutoRefresh(intervalSeconds: number = 30) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const { refreshToken, checkValidAccessToken, logout } = useAuth()

  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // cleanup previous interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const tick = async () => {
      const state = useAuthStore.getState()
      const accessToken = state.accessToken
      const rt = state.refreshToken

      if (!accessToken || !rt) {
        // Not authenticated; nothing to do
        return
      }

      try {
        const resp = await checkValidAccessToken({ accessToken })
        if (resp.data.valid) {
          return
        }
        // invalid -> try refresh
        const r = await refreshToken({ refreshToken: rt })
        const data = r.data
        setAuth({
          accessToken: data.token,
          refreshToken: data.rt,
          expiresIn: data.tokenExp,
          refreshExpiresIn: data.rtExp
        })
      } catch (e) {
        // If refresh fails or check fails -> logout
        await logout()
      }
    }

    // First tick immediately, then on interval
    tick()
    intervalRef.current = window.setInterval(tick, intervalSeconds * 1000)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [intervalSeconds, setAuth, refreshToken, checkValidAccessToken, logout])
}
