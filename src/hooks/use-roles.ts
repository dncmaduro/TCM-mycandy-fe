import { useAuthStore } from "../stores/authState"
import {
  GetOwnRoleResponse,
  GetRoleResponse,
  SetRoleRequest,
  SetRoleResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useRoles = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const getRole = async (userId: string) => {
    return callApi<never, GetRoleResponse>({
      method: "GET",
      path: `/roleusers/${userId}`,
      token: accessToken || undefined
    })
  }

  const setRole = async (userId: string, data: SetRoleRequest) => {
    return callApi<SetRoleRequest, SetRoleResponse>({
      method: "POST",
      path: `/roleusers/${userId}`,
      token: accessToken || undefined,
      data
    })
  }

  const removeRole = async (userId: string) => {
    return callApi<never, GetRoleResponse>({
      method: "DELETE",
      path: `/roleusers/${userId}`,
      token: accessToken || undefined
    })
  }

  const getOwnRole = async () => {
    return callApi<never, GetOwnRoleResponse>({
      method: "GET",
      path: `/roleusers/me`,
      token: accessToken || undefined
    })
  }

  return {
    getRole,
    setRole,
    removeRole,
    getOwnRole
  }
}
