import { Role } from "../constants/role"
import { IUser } from "./interfaces"

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
