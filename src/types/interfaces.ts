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
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}
