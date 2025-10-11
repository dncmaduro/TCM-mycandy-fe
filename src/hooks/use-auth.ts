import { useAuthStore } from "../stores/authState"
import { useNavigate } from "@tanstack/react-router"
import {
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useAuth = () => {
  const navigate = useNavigate()
  const refreshStoreToken = useAuthStore((s) => s.refreshToken)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const refreshToken = async (req: RefreshTokenRequest) => {
    return callApi<RefreshTokenRequest, RefreshTokenResponse>({
      method: "POST",
      path: "/auth/refresh",
      data: req
    })
  }

  const logout = async () => {
    try {
      if (refreshStoreToken) {
        await callApi<LogoutRequest, LogoutResponse>({
          method: "POST",
          path: "/auth/logout",
          data: { refreshToken: refreshStoreToken } as LogoutRequest
        })
      }
    } catch (e) {
    } finally {
      clearAuth()
      navigate({ to: "/", replace: true })
    }
  }

  return { refreshToken, logout }
}
