import { useAuthStore } from "../stores/authState"
import {
  ApproveTimeRequestResponse,
  CreateTimeRequestRequest,
  CreateTimeRequestResponse,
  DeleteTimeRequestResponse,
  GetAllTimeRequestsParams,
  GetAllTimeRequestsResponse,
  GetOwnTimeRequestByMonthResponse,
  GetOwnTimeRequestsParams,
  GetOwnTimeRequestsResponse,
  GetTimeRequestResponse,
  RejectTimeRequestResponse,
  UpdateTimeRequestRequest,
  UpdateTimeRequestResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useTimeRequests = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const createTimeRequest = async (data: CreateTimeRequestRequest) => {
    return callApi<CreateTimeRequestRequest, CreateTimeRequestResponse>({
      method: "POST",
      path: "/time-requests",
      data,
      token: accessToken || undefined
    })
  }

  const updateTimeRequest = async (
    requestId: string,
    data: UpdateTimeRequestRequest
  ) => {
    return callApi<UpdateTimeRequestRequest, UpdateTimeRequestResponse>({
      method: "PATCH",
      path: `/time-requests/${requestId}`,
      data,
      token: accessToken || undefined
    })
  }

  const getOwnTimeRequests = async (params: GetOwnTimeRequestsParams) => {
    return callApi<never, GetOwnTimeRequestsResponse>({
      method: "GET",
      path: "/time-requests/my",
      params,
      token: accessToken || undefined
    })
  }

  const getAllTimeRequests = async (params: GetAllTimeRequestsParams) => {
    return callApi<never, GetAllTimeRequestsResponse>({
      method: "GET",
      path: "/time-requests/all",
      params,
      token: accessToken || undefined
    })
  }

  const approveTimeRequest = async (requestId: string) => {
    return callApi<never, ApproveTimeRequestResponse>({
      method: "POST",
      path: `/time-requests/${requestId}/approve`,
      token: accessToken || undefined
    })
  }

  const rejectTimeRequest = async (requestId: string) => {
    return callApi<never, RejectTimeRequestResponse>({
      method: "POST",
      path: `/time-requests/${requestId}/reject`,
      token: accessToken || undefined
    })
  }

  const deleteTimeRequest = async (requestId: string) => {
    return callApi<never, DeleteTimeRequestResponse>({
      method: "DELETE",
      path: `/time-requests/${requestId}`,
      token: accessToken || undefined
    })
  }

  const getTimeRequest = async (requestId: string) => {
    return callApi<never, GetTimeRequestResponse>({
      method: "GET",
      path: `/time-requests/${requestId}`,
      token: accessToken || undefined
    })
  }

  const getOwnTimeRequestsByMonth = async () => {
    const date = new Date()

    return callApi<never, GetOwnTimeRequestByMonthResponse>({
      method: "GET",
      path: `/time-requests/month/${date.getMonth() + 1}/year/${date.getFullYear()}`,
      token: accessToken || undefined
    })
  }

  return {
    createTimeRequest,
    updateTimeRequest,
    getOwnTimeRequests,
    getAllTimeRequests,
    approveTimeRequest,
    rejectTimeRequest,
    deleteTimeRequest,
    getTimeRequest,
    getOwnTimeRequestsByMonth
  }
}
