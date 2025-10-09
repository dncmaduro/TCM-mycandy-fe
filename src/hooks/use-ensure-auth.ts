import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "../stores/authState"

/**
 * Guard hook to protect private routes. Call inside component of protected route.
 */
export function useEnsureAuth(options?: { redirectTo?: string }) {
  const redirectTo = options?.redirectTo ?? "/"
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const isTokenExpired = useAuthStore((s) => s.isTokenExpired())
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    if (!isAuthenticated || isTokenExpired) {
      clearAuth()
      navigate({ to: redirectTo, replace: true })
    }
  }, [isAuthenticated, isTokenExpired, clearAuth, navigate, redirectTo])

  return { isAuthenticated: !isTokenExpired && isAuthenticated }
}
