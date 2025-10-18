import { useAuthStore } from "../stores/authState"
import {
  CreateTaskRequest,
  CreateTaskResponse,
  GetAllUsersCurrentSprintStatsResponse,
  GetMyCurrentSprintStatsResponse,
  GetSubtasksResponse,
  GetTaskResponse,
  SearchTaskLogsParams,
  SearchTaskLogsResponse,
  SearchTasksParams,
  SearchTasksResponse,
  UpdateTaskRequest,
  UpdateTaskResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useTasks = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const createTask = async (data: CreateTaskRequest) => {
    return callApi<CreateTaskRequest, CreateTaskResponse>({
      method: "POST",
      path: "/tasks",
      token: accessToken || undefined,
      data
    })
  }

  const updateTask = async (taskId: string, data: UpdateTaskRequest) => {
    return callApi<UpdateTaskRequest, UpdateTaskResponse>({
      method: "PATCH",
      path: `/tasks/${taskId}`,
      token: accessToken || undefined,
      data
    })
  }

  const deleteTask = async (taskId: string) => {
    return callApi<never, { deleted: boolean }>({
      method: "DELETE",
      path: `/tasks/${taskId}`,
      token: accessToken || undefined
    })
  }

  const assignTask = async (taskId: string, userId: string) => {
    return callApi<never, { assigned: boolean }>({
      method: "POST",
      path: `/tasks/${taskId}/assign/${userId}`,
      token: accessToken || undefined
    })
  }

  const searchTasks = async (params: SearchTasksParams) => {
    return callApi<never, SearchTasksResponse>({
      method: "GET",
      path: "/tasks/search",
      token: accessToken || undefined,
      params
    })
  }

  const getSubTasks = async (parentTaskId: string) => {
    return callApi<never, GetSubtasksResponse>({
      method: "GET",
      path: `/tasks/${parentTaskId}/subtasks`,
      token: accessToken || undefined
    })
  }

  const getTask = async (taskId: string) => {
    return callApi<never, GetTaskResponse>({
      method: "GET",
      path: `/tasks/${taskId}`,
      token: accessToken || undefined
    })
  }

  const getMyCurrentSprintStats = async () => {
    return callApi<never, GetMyCurrentSprintStatsResponse>({
      method: "GET",
      path: `/tasks/stats/current-sprint/my`,
      token: accessToken || undefined
    })
  }

  const getAllUsersCurrentSprintStats = async () => {
    return callApi<never, GetAllUsersCurrentSprintStatsResponse>({
      method: "GET",
      path: `/tasks/stats/current-sprint/all-users`,
      token: accessToken || undefined
    })
  }

  const searchTaskLogs = async (params: SearchTaskLogsParams) => {
    return callApi<never, SearchTaskLogsResponse>({
      method: "GET",
      path: `/task-logs`,
      token: accessToken || undefined,
      params
    })
  }

  return {
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    searchTasks,
    getSubTasks,
    getTask,
    getMyCurrentSprintStats,
    getAllUsersCurrentSprintStats,
    searchTaskLogs
  }
}
