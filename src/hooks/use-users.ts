import { callApi } from "../utils/axios"
import { useAuthStore } from "../stores/authState"
import { GetMeResponse } from "../types/models"

export const useUsers = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const getMe = async () => {
    return callApi<never, GetMeResponse>({
      method: "GET",
      path: "/users/me",
      token: accessToken || undefined
    })
  }

  return { getMe }
}
