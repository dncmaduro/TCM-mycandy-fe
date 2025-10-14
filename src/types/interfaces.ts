export type UserStatus = "pending" | "active" | "rejected" | "suspended"

export interface IUser {
  _id: string
  email: string
  name?: string
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
