import { useAuthStore } from "../stores/authState"
import {
  CreateTaskTagRequest,
  CreateTaskTagResponse,
  DeleteTaskTagResponse,
  GetAllTaskTagsResponse,
  GetTaskTagResponse,
  RestoreTaskTagResponse,
  SearchTaskTagsParams,
  SearchTaskTagsResponse,
  UpdateTaskTagRequest,
  UpdateTaskTagResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useTaskTags = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const createTaskTag = async (data: CreateTaskTagRequest) => {
    return callApi<CreateTaskTagRequest, CreateTaskTagResponse>({
      method: "POST",
      path: "/task-tags",
      data,
      token: accessToken || undefined
    })
  }

  const updateTaskTag = async (tagId: string, data: UpdateTaskTagRequest) => {
    return callApi<UpdateTaskTagRequest, UpdateTaskTagResponse>({
      method: "PATCH",
      path: `/task-tags/${tagId}`,
      data,
      token: accessToken || undefined
    })
  }

  const deleteTaskTag = async (tagId: string) => {
    return callApi<never, DeleteTaskTagResponse>({
      method: "DELETE",
      path: `/task-tags/${tagId}`,
      token: accessToken || undefined
    })
  }

  const searchTaskTags = async (params: SearchTaskTagsParams) => {
    return callApi<SearchTaskTagsParams, SearchTaskTagsResponse>({
      method: "GET",
      path: "/task-tags/search",
      params,
      token: accessToken || undefined
    })
  }

  const getAllTaskTags = async () => {
    return callApi<never, GetAllTaskTagsResponse>({
      method: "GET",
      path: "/task-tags",
      token: accessToken || undefined
    })
  }

  const restoreTaskTag = async (tagId: string) => {
    return callApi<never, RestoreTaskTagResponse>({
      method: "PATCH",
      path: `/task-tags/${tagId}/restore`,
      token: accessToken || undefined
    })
  }

  const getTaskTag = async (tagId: string) => {
    return callApi<never, GetTaskTagResponse>({
      method: "GET",
      path: `/task-tags/${tagId}`,
      token: accessToken || undefined
    })
  }

  return {
    createTaskTag,
    updateTaskTag,
    deleteTaskTag,
    searchTaskTags,
    getAllTaskTags,
    restoreTaskTag,
    getTaskTag
  }
}
