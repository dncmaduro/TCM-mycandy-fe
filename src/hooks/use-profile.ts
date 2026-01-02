import { useAuthStore } from "../stores/authState"
import {
  AdminSearchProfilesParams,
  AdminSearchProfilesResponse,
  ApproveProfileResponse,
  GetAllProfilesParams,
  GetAllProfilesResponse,
  GetMyProfileResonse,
  GetProfileParams,
  PublicSearchProfilesParams,
  PublicSearchProfilesResponse,
  RejectProfileResponse,
  SuspendProfileResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse
} from "../types/models"
import { callApi, toQueryString } from "../utils/axios"

export const useProfile = () => {
  const { accessToken } = useAuthStore()

  const getMyProfile = async () => {
    if (accessToken) {
      return callApi<never, GetMyProfileResonse>({
        path: "/profiles/me",
        method: "GET",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const getProfile = async (params: GetProfileParams) => {
    if (accessToken) {
      return callApi<never, GetMyProfileResonse>({
        path: `/profiles/${params.id}`,
        method: "GET",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const updateMyProfile = async (data: UpdateMyProfileRequest) => {
    if (accessToken) {
      return callApi<UpdateMyProfileRequest, UpdateMyProfileResponse>({
        path: "/profiles/me",
        method: "PATCH",
        token: accessToken,
        data
      })
    }

    return Promise.reject()
  }

  const getAllProfiles = async (params: GetAllProfilesParams) => {
    if (accessToken) {
      return callApi<never, GetAllProfilesResponse>({
        path: `/profiles?${toQueryString(params)}`,
        method: "GET",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const approveProfile = async (id: string) => {
    if (accessToken) {
      return callApi<never, ApproveProfileResponse>({
        path: `/profiles/${id}/approve`,
        method: "PATCH",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const rejectProfile = async (id: string) => {
    if (accessToken) {
      return callApi<never, RejectProfileResponse>({
        path: `/profiles/${id}/reject`,
        method: "PATCH",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const suspendProfile = async (id: string) => {
    if (accessToken) {
      return callApi<never, SuspendProfileResponse>({
        path: `/profiles/${id}/suspend`,
        method: "PATCH",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const publicSearchProfiles = async (params: PublicSearchProfilesParams) => {
    if (accessToken) {
      return callApi<never, PublicSearchProfilesResponse>({
        path: `/profiles/public-search?${toQueryString(params)}`,
        method: "GET",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  const adminSearchProfiles = async (params: AdminSearchProfilesParams) => {
    if (accessToken) {
      return callApi<never, AdminSearchProfilesResponse>({
        path: `/profiles/admin-search?${toQueryString(params)}`,
        method: "GET",
        token: accessToken
      })
    }

    return Promise.reject()
  }

  return {
    getMyProfile,
    getProfile,
    updateMyProfile,
    getAllProfiles,
    approveProfile,
    rejectProfile,
    suspendProfile,
    publicSearchProfiles,
    adminSearchProfiles
  }
}
