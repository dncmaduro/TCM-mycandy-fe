import { callApi } from "../utils/axios"
import { useAuthStore } from "../stores/authState"
import {
  ApproveUserResponse,
  GetMeResponse,
  GetUserResponse,
  PublicSearchUsersParams,
  PublicSearchUsersResponse,
  RejectUserResponse,
  SearchUsersParams,
  SearchUsersResponse,
  SuspendUserResponse
} from "../types/models"

export const useUsers = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const getMe = async () => {
    return callApi<never, GetMeResponse>({
      method: "GET",
      path: "/users/me",
      token: accessToken || undefined
    })
  }

  const approveUser = async (email: string) => {
    return callApi<never, ApproveUserResponse>({
      method: "POST",
      path: `/users/${email}/approve`,
      token: accessToken || undefined
    })
  }

  const rejectUser = async (email: string) => {
    return callApi<never, RejectUserResponse>({
      method: "POST",
      path: `/users/${email}/reject`,
      token: accessToken || undefined
    })
  }

  const suspendUser = async (email: string) => {
    return callApi<never, SuspendUserResponse>({
      method: "POST",
      path: `/users/${email}/suspend`,
      token: accessToken || undefined
    })
  }

  const searchUsers = async (params: SearchUsersParams) => {
    return callApi<never, SearchUsersResponse>({
      method: "GET",
      path: "/users/search",
      token: accessToken || undefined,
      params
    })
  }

  const getUser = async (userId: string) => {
    return callApi<never, GetUserResponse>({
      method: "GET",
      path: `/users/${userId}`,
      token: accessToken || undefined
    })
  }

  const publicSearchUsers = async (params: PublicSearchUsersParams) => {
    return callApi<never, PublicSearchUsersResponse>({
      method: "GET",
      path: "/users/public/search",
      params,
      token: accessToken || undefined
    })
  }

  return {
    getMe,
    approveUser,
    rejectUser,
    suspendUser,
    searchUsers,
    getUser,
    publicSearchUsers
  }
}
