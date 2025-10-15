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

  useEffect(() => {
    if (!isAuthenticated) {
      // Do not clear here; logout flow handles clearing
      navigate({ to: redirectTo, replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  return { isAuthenticated }
}
