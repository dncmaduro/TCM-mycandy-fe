import { Role } from "../constants/role"
import { ITask, IUser, TaskPriority, TaskStatus } from "./interfaces"

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
