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
