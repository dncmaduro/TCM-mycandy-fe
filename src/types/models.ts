import { Role } from "../constants/role"
import {
  ISprint,
  ITask,
  ITaskTags,
  IUser,
  TaskPriority,
  TaskStatus
} from "./interfaces"

/** @interface */
export interface RefreshTokenRequest {
  refreshToken: string
}

/** @interface */
export interface RefreshTokenResponse {
  token: string
  rt: string
  tokenExp: number
  rtExp: number
}

/** @interface */
export interface LogoutRequest {
  refreshToken: string
}

/** @interface */
export interface LogoutResponse {
  success: boolean
}

/** @interface */
export interface GetMeResponse {
  user: IUser
}

/** @interface */
export interface ApproveUserResponse {
  user: IUser
}

/** @interface */
export interface RejectUserResponse {
  user: IUser
}

/** @interface */
export interface SuspendUserResponse {
  user: IUser
}

/** @interface */
export interface SearchUsersParams {
  searchText?: string
  role?: string
  page?: number
  limit?: number
}

/** @interface */
export interface SearchUsersResponse {
  data: IUser[]
  totalPages: number
}

/** @interface */
export interface GetUserResponse {
  user: IUser | null
}

/** @interface */
export interface GetRoleResponse {
  userId: string
  role: string
}

/** @interface */
export interface SetRoleRequest {
  role: Role
}

/** @interface */
export interface SetRoleResponse {
  userId: string
  role: string
}

/** @interface */
export interface RemoveRoleResponse {
  userId: string
  removed: boolean
}

/** @interface */
export interface GetOwnRoleResponse {
  userId: string
  role: string
}

/** @interface */
export interface CreateTaskRequest {
  title: string
  sprint: string
  description?: string
  parentTaskId?: string
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: Date
  tags?: string[]
}

/** @interface */
export interface CreateTaskResponse {
  task: ITask
}

/** @interface */
export interface UpdateTaskRequest {
  title?: string
  sprint?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: Date
  tags?: string[]
}

/** @interface */
export interface UpdateTaskResponse {
  task: ITask
}

/** @interface */
export interface DeleteTaskResponse {
  task: ITask | null
}

/** @interface */
export interface AssignTaskRequest {
  assignedTo?: string
}

/** @interface */
export interface AssignTaskResponse {
  task: ITask
}

/** @interface */
export interface SearchTasksParams {
  searchText?: string
  sprint?: string
  createdBy?: string
  assignedTo?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueBefore?: string
  dueAfter?: string
  tags?: string[]
  page?: number
  limit?: number
}

/** @interface */
export interface SearchTasksResponse {
  data: ITask[]
  totalPages: number
}

/** @interface */
export interface GetSubtasksResponse {
  subtasks: ITask[]
}

/** @interface */
export interface GetTaskResponse {
  task: ITask | null
}

/** @interface */
export interface PublicSearchUsersParams {
  searchText?: string
  page?: number
  limit?: number
}

/** @interface */
export interface PublicSearchUsersResponse {
  data: IUser[]
  totalPages: number
}

/** @interface */
export interface CheckValidAccessTokenRequest {
  accessToken: string
}

/** @interface */
export interface CheckValidAccessTokenResponse {
  valid: boolean
}

/** @interface */
export interface CreateTaskTagRequest {
  name: string
  color?: string
}

/** @interface */
export interface CreateTaskTagResponse {
  tag: ITaskTags
}

/** @interface */
export interface UpdateTaskTagRequest {
  name?: string
  color?: string
}

/** @interface */
export interface UpdateTaskTagResponse {
  tag: ITaskTags
}

/** @interface */
export interface DeleteTaskTagResponse {
  deleted: boolean
}

/** @interface */
export interface SearchTaskTagsParams {
  searchText?: string
  page?: number
  limit?: number
  deleted?: boolean
}

/** @interface */
export interface SearchTaskTagsResponse {
  data: ITaskTags[]
  totalPages: number
}

/** @interface */
export interface GetAllTaskTagsResponse {
  data: ITaskTags[]
}

/** @interface */
export interface RestoreTaskTagResponse {
  tag: ITaskTags
}

/** @interface */
export interface GetTaskTagResponse {
  tag: ITaskTags | null
}

/** @interface */
export interface CreateSprintRequest {
  name: string
  startDate: Date
  endDate: Date
}

/** @interface */
export interface CreateSprintResponse {
  sprint: ISprint
}

/** @interface */
export interface DeleteSprintResponse {
  message: string
}

/** @interface */
export interface RestoreSprintResponse {
  message: string
}

/** @interface */
export interface GetSprintsParams {
  limit?: number
}

/** @interface */
export interface GetSprintsResponse {
  data: ISprint[]
}

/** @interface */
export interface GetSprintResponse {
  sprint: ISprint | null
}
