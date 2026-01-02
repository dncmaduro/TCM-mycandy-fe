import { useAuthStore } from "../stores/authState"
import {
  AssignManagerRequest,
  AssignManagerResponse,
  GetUserManagementsParams,
  GetUserManagementsResponse,
  GetManagerOfEmployeeReponse,
  GetEmployeesOfManagerResponse,
  RemoveManagementRequest,
  RemoveManagementResponse
} from "../types/models"
import { callApi, toQueryString } from "../utils/axios"

export const useUserManagement = () => {
  const { accessToken } = useAuthStore()

  const assignManager = async (data: AssignManagerRequest) => {
    if (accessToken) {
      return callApi<AssignManagerRequest, AssignManagerResponse>({
        path: "/user-management/assign",
        method: "POST",
        token: accessToken,
        data
      })
    }
    return Promise.reject()
  }

  const removeManagement = async (params: RemoveManagementRequest) => {
    if (accessToken) {
      return callApi<RemoveManagementRequest, RemoveManagementResponse>({
        path: `/user-management/manager/${params.managerId}/employee/${params.employeeId}`,
        method: "DELETE",
        token: accessToken
      })
    }
    return Promise.reject()
  }

  const getAllManagements = async (params: GetUserManagementsParams) => {
    if (accessToken) {
      return callApi<never, GetUserManagementsResponse>({
        path: `/user-management?${toQueryString(params)}`,
        method: "GET",
        token: accessToken
      })
    }
    return Promise.reject()
  }

  const getManagerOfEmployee = async (employeeId: string) => {
    if (accessToken) {
      return callApi<never, GetManagerOfEmployeeReponse>({
        path: `/user-management/employee/${employeeId}/manager`,
        method: "GET",
        token: accessToken
      })
    }
    return Promise.reject()
  }

  const getEmployeesOfManager = async (
    managerId: string,
    params: { page?: number; limit?: number }
  ) => {
    if (accessToken) {
      return callApi<never, GetEmployeesOfManagerResponse>({
        path: `/user-management/manager/${managerId}/employees?${toQueryString(params)}`,
        method: "GET",
        token: accessToken
      })
    }
    return Promise.reject()
  }

  return {
    assignManager,
    removeManagement,
    getAllManagements,
    getManagerOfEmployee,
    getEmployeesOfManager
  }
}
