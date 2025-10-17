import { useAuthStore } from "../stores/authState"
import {
  CreateSprintRequest,
  CreateSprintResponse,
  DeleteSprintResponse,
  GetSprintResponse,
  GetSprintsParams,
  GetSprintsResponse,
  RestoreSprintResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useSprints = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const createSprint = (data: CreateSprintRequest) => {
    return callApi<CreateSprintRequest, CreateSprintResponse>({
      method: "POST",
      path: "/sprints",
      data,
      token: accessToken || undefined
    })
  }

  const deleteSprint = (sprintId: string) => {
    return callApi<never, DeleteSprintResponse>({
      method: "DELETE",
      path: `/sprints/${sprintId}`,
      token: accessToken || undefined
    })
  }

  const getSprints = (params: GetSprintsParams) => {
    return callApi<never, GetSprintsResponse>({
      method: "GET",
      path: "/sprints",
      params,
      token: accessToken || undefined
    })
  }

  const getSprint = (sprintId: string) => {
    return callApi<never, GetSprintResponse>({
      method: "GET",
      path: `/sprints/${sprintId}`,
      token: accessToken || undefined
    })
  }

  const restoreSprint = (sprintId: string) => {
    return callApi<never, RestoreSprintResponse>({
      method: "PATCH",
      path: `/sprints/${sprintId}/restore`,
      token: accessToken || undefined
    })
  }

  return {
    createSprint,
    deleteSprint,
    getSprints,
    getSprint,
    restoreSprint
  }
}
