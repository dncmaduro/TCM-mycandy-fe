import { useAuthStore } from "../stores/authState"
import { useNavigate } from "@tanstack/react-router"
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckValidAccessTokenRequest,
  CheckValidAccessTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useAuth = () => {
  const navigate = useNavigate()
  const refreshStoreToken = useAuthStore((s) => s.refreshToken)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const register = async (req: RegisterRequest) => {
    return callApi<RegisterRequest, RegisterResponse>({
      method: "POST",
      path: "/auth/register",
      data: req
    })
  }

  const login = async (req: LoginRequest) => {
    return callApi<LoginRequest, LoginResponse>({
      method: "POST",
      path: "/auth/login",
      data: req
    })
  }

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

  const checkValidAccessToken = async (req: CheckValidAccessTokenRequest) => {
    return callApi<CheckValidAccessTokenRequest, CheckValidAccessTokenResponse>(
      {
        method: "POST",
        path: "/auth/validate",
        data: req
      }
    )
  }

  const changePassword = async (req: ChangePasswordRequest) => {
    return callApi<ChangePasswordRequest, ChangePasswordResponse>({
      method: "POST",
      path: "/auth/change-password",
      data: req
    })
  }

  const forgotPassword = async (req: ForgotPasswordRequest) => {
    return callApi<ForgotPasswordRequest, ForgotPasswordResponse>({
      method: "POST",
      path: "/auth/forgot-password",
      data: req
    })
  }

  const resetPassword = async (req: ResetPasswordRequest) => {
    return callApi<ResetPasswordRequest, ResetPasswordResponse>({
      method: "POST",
      path: "/auth/reset-password",
      data: req
    })
  }

  return {
    refreshToken,
    login,
    logout,
    checkValidAccessToken,
    register,
    changePassword,
    forgotPassword,
    resetPassword
  }
}
