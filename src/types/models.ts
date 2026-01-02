import { Role } from "../constants/role"
import {
  INotification,
  IProfile,
  ISprint,
  ITask,
  ITaskLog,
  ITaskTags,
  ITimeRequest,
  IUser,
  ProfileStatus,
  TaskLogType,
  TaskPriority,
  TaskStatus,
  TimeRequestStatus,
  TimeRequestType
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
export interface GetRolesResponse {
  userId: string
  roles: string[]
}

/** @interface */
export interface SetRoleRequest {
  roles: Role[]
}

/** @interface */
export interface SetRoleResponse {
  userId: string
  roles: string[]
}

/** @interface */
export interface RemoveRoleResponse {
  userId: string
  removed: boolean
}

/** @interface */
export interface GetOwnRoleResponse {
  userId: string
  roles: string[]
}

/** @interface */
export interface GetRolesParams {
  profileId: string
}

/** @interface */
export interface GetRolesResponse {
  profileId: string
  roles: string[]
}

/** @interface */
export interface CreateTaskRequest {
  title: string
  sprint: string
  description?: string
  priority?: TaskPriority
  aim: number
  aimUnit?: string
  assignedTo?: string
  dueDate?: Date
  tags?: string[]
  estimateHours?: number
  evaluation?: string
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
  priority?: TaskPriority
  aim?: number
  aimUnit?: string
  progress?: number
  assignedTo?: string
  dueDate?: Date
  tags?: string[]
  estimateHours?: number
  evaluation?: string
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
  total: number
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
  page?: number
  limit?: number
  deleted?: boolean
}

/** @interface */
export interface GetSprintsResponse {
  data: ISprint[]
  total: number
}

/** @interface */
export interface GetSprintResponse {
  sprint: ISprint | null
}

/** @interface */
export interface GetMyCurrentSprintStatsResponse {
  new: number
  in_progress: number
  reviewing: number
  completed: number
}

/** @interface */
export interface GetAllUsersCurrentSprintStatsResponse {
  users: {
    profile: {
      _id: string
      name: string
    }
    totalTasks: number
    totalUnits: number
    completedTasks: number
    completedUnits: number
    totalEstimateHours: number
  }[]
}

/** @interface */
export interface SetCurrentSprintResponse {
  message: string
}

/** @interface */
export interface MoveTasksToSprintResponse {
  message: string
  movedTasks: number
}

/** @interface */
export interface GetCurrentSprintResponse {
  sprint: ISprint | null
  taskStats: {
    new: number
    in_progress: number
    reviewing: number
    completed: number
    total: number
  }
}

/** @interface */
export interface CreateTimeRequestRequest {
  type: TimeRequestType
  reason: string
  minutes?: number
  date: Date
}

/** @interface */
export interface CreateTimeRequestResponse {
  request: ITimeRequest
}

/** @interface */
export interface UpdateTimeRequestRequest {
  type?: TimeRequestType
  reason?: string
  minutes?: number
  date?: Date
}

/** @interface */
export interface UpdateTimeRequestResponse {
  request: ITimeRequest
}

/** @interface */
export interface GetOwnTimeRequestsParams {
  page?: number
  limit?: number
  deleted?: boolean
}

/** @interface */
export interface GetOwnTimeRequestsResponse {
  data: ITimeRequest[]
  total: number
}

/** @interface */
export interface GetPendingTimeRequestsParams {
  page?: number
  limit?: number
}

/** @interface */
export interface GetPendingTimeRequestsResponse {
  data: ITimeRequest[]
  total: number
}

/** @interface */
export interface GetAllTimeRequestsParams {
  page?: number
  limit?: number
  date?: Date
  status?: TimeRequestStatus
}

/** @interface */
export interface GetAllTimeRequestsResponse {
  data: ITimeRequest[]
  total: number
}

/** @interface */
export interface ApproveTimeRequestResponse {
  message: string
}

/** @interface */
export interface RejectTimeRequestResponse {
  message: string
}

/** @interface */
export interface DeleteTimeRequestResponse {
  message: string
}

/** @interface */
export interface GetTimeRequestResponse {
  request: ITimeRequest | null
}

/** @interface */
export interface GetOwnTimeRequestByMonthResponse {
  requests: ITimeRequest[]
}

/** @interface */
export interface GetPendingReviewRequestsParams {
  page: number
  limit: number
  status?: TimeRequestStatus
}

/** @interface */
export interface GetPendingReviewRequestsResponse {
  data: ITimeRequest[]
  total: number
}

/** @interface */
export interface SearchTaskLogsParams {
  taskId?: string
  userId?: string
  type?: TaskLogType
  startTime?: Date
  endTime?: Date
  page?: number
  limit?: number
}

/** @interface */
export interface SearchTaskLogsResponse {
  data: ITaskLog[]
  totalPages: number
}

/** @interface */
export interface GetNotificationsParams {
  page?: number
  limit?: number
  isRead?: boolean
}

/** @interface */
export interface GetNotificationsResponse {
  data: INotification[]
  totalPages: number
  unreadCount: number
  page: number
}

/** @interface */
export interface SetAllNotificationsReadResponse {
  message: string
}

/** @interface */
export interface SetNotificationReadResponse {
  message: string
  notification: INotification
}

/** @interface */
export interface SetNotificationUnreadResponse {
  message: string
  notification: INotification
}

/** @interface */
export interface RegisterRequest {
  email: string
  password: string
  name: string
}

/** @interface */
export interface RegisterResponse {
  message: string
  accountId: string
  profileId: string
  verificationRequired: boolean
}

/** @interface */
export interface LoginRequest {
  email: string
  password: string
}

/** @interface */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenExp: number
  rtExp: number
  profile: {
    id: string
    name: string
    status: string
  }
}

/** @interface */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/** @interface */
export interface ChangePasswordResponse {
  message: string
}

/** @interface */
export interface ForgotPasswordRequest {
  email: string
}

/** @interface */
export interface ForgotPasswordResponse {
  message: string
}

/** @interface */
export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

/** @interface */
export interface ResetPasswordResponse {
  message: string
}

/** @interface */
export interface GetMyProfileResonse {
  profile: IProfile
}

/** @interface */
export interface GetProfileParams {
  id: string
}

/** @interface */
export interface GetProfileResponse {
  profile: IProfile
}

/** @interface */
export interface UpdateMyProfileRequest {
  name?: string
  avatarUrl?: string
}

/** @interface */
export interface UpdateMyProfileResponse {
  profile: IProfile
}

/** @interface */
export interface GetAllProfilesParams {
  page: number
  limit: number
  status?: ProfileStatus
}

/** @interface */
export interface GetAllProfilesResponse {
  data: IProfile[]
  total: number
}

/** @interface */
export interface ApproveProfileResponse {
  profile: IProfile
}

/** @interface */
export interface RejectProfileResponse {
  profile: IProfile
}

/** @interface */
export interface SuspendProfileResponse {
  profile: IProfile
}

/** @interface */
export interface PublicSearchProfilesParams {
  searchText?: string
  page?: number
  limit?: number
}

/** @interface */
export interface AdminSearchProfilesParams {
  searchText?: string
  page?: number
  limit?: number
  status?: ProfileStatus
  role?: Role
}

/** @interface */
export interface AdminSearchProfilesResponse {
  data: IProfile[]
  total: number
}

/** @interface */
export interface PublicSearchProfilesResponse {
  data: {
    _id: string
    name: string
    avatarUrl: string
  }[]
  total: number
}

/** @interface */
export interface AssignManagerRequest {
  managerId: string
  employeeId: string
}

/** @interface */
export interface AssignManagerResponse {
  managerId: string
  employeeId: string
  manager: IProfile
  employee: IProfile
}

/** @interface */
export interface GetUserManagementsParams {
  page: number
  limit: number
}

/** @interface */
export interface GetUserManagementsResponse {
  data: {
    _id: string
    manager: {
      _id: string
      name?: string
      avatarUrl?: string
    }
    employee: {
      _id: string
      name?: string
      avatarUrl?: string
    }
    createdAt: Date
  }[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** @interface */
export interface GetManagerOfEmployeeReponse {
  manager: {
    _id: string
    name?: string
    avatarUrl?: string
  } | null
}

/** @interface */
export interface GetEmployeesOfManagerResponse {
  data: {
    _id: string
    name?: string
    avatarUrl?: string
    assignedAt: Date
  }[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** @interface */
export interface RemoveManagementRequest {
  managerId: string
  employeeId: string
}

/** @interface */
export interface RemoveManagementResponse {
  message: string
}
