export type UserStatus = "pending" | "active" | "rejected" | "suspended"

export interface IUser {
  _id: string
  email: string
  name: string
  avatarUrl?: string
  googleSub: string
  status: UserStatus
  approvedBy?: string | null
  approvedAt?: Date | null
  rejectedReason?: string | null
  consentCalendar: boolean
  createdAt: Date
  updatedAt: Date
}

export type TaskStatus =
  | "new"
  | "in_progress"
  | "completed"
  | "archived"
  | "canceled"
  | "reviewing"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface ITask {
  _id: string
  title: string
  description?: string
  parentTaskId?: string | null
  sprint: string
  status: TaskStatus
  priority: TaskPriority
  createdBy: string
  assignedTo?: string | null
  dueDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  tags?: string[]
}

export interface ITaskTags {
  _id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ISprint {
  _id: string
  name: string
  startDate: Date
  endDate: Date
  isCurrent?: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type TimeRequestStatus = "pending" | "approved" | "rejected"

export type TimeRequestType =
  | "overtime"
  | "day_off"
  | "remote_work"
  | "leave_early"
  | "late_arrival"

export interface ITimeRequest {
  _id: string
  createdBy: string
  type: TimeRequestType
  reason: string
  minutes?: number
  date: Date | null
  status: TimeRequestStatus
  reviewedBy?: string | null
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type TaskLogType =
  | "status_change"
  | "comment"
  | "update_information"
  | "assignment"

export interface ITaskLog {
  _id: string
  taskId: string
  type: TaskLogType
  userId: string
  meta?: Record<string, any>
  createdAt: Date
}

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "comment_mentioned"
  | "task_status_changed"
  | "task_due_soon"
  | "comment_added"
  | "time_request_approved"
  | "time_request_rejected"
  | "time_request_added"
  | "sprint_started"
  | "new_user"

export interface INotification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}
