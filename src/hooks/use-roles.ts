import { useAuthStore } from "../stores/authState"
import {
  GetOwnRoleResponse,
  GetRolesResponse,
  SetRoleRequest,
  SetRoleResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useRoles = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const getOwnRole = async () => {
    return callApi<never, GetOwnRoleResponse>({
      method: "GET",
      path: `/roleusers/me`,
      token: accessToken || undefined
    })
  }

  const getRole = async (userId: string) => {
    return callApi<never, GetRolesResponse>({
      method: "GET",
      path: `/roleusers/${userId}`,
      token: accessToken || undefined
    })
  }

  const setRole = async (profileId: string, data: SetRoleRequest) => {
    return callApi<SetRoleRequest, SetRoleResponse>({
      method: "POST",
      path: `/roleusers/${profileId}/set-roles`,
      token: accessToken || undefined,
      data
    })
  }

  const removeRole = async (userId: string) => {
    return callApi<never, GetRolesResponse>({
      method: "DELETE",
      path: `/roleusers/${userId}`,
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
