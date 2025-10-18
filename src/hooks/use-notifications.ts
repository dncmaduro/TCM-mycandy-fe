import { useAuthStore } from "../stores/authState"
import {
  GetNotificationsParams,
  GetNotificationsResponse,
  SetAllNotificationsReadResponse,
  SetNotificationReadResponse,
  SetNotificationUnreadResponse
} from "../types/models"
import { callApi } from "../utils/axios"

export const useNotifications = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const getNotifications = async (params: GetNotificationsParams) => {
    return callApi<never, GetNotificationsResponse>({
      method: "GET",
      path: "/notifications",
      token: accessToken || undefined,
      params
    })
  }

  const setAllNotificationsReadResponse = async () => {
    return callApi<never, SetAllNotificationsReadResponse>({
      method: "POST",
      path: "/notifications/read-all",
      token: accessToken || undefined
    })
  }

  const setNotificationRead = async (notificationId: string) => {
    return callApi<never, SetNotificationReadResponse>({
      method: "POST",
      path: `/notifications/${notificationId}/read`,
      token: accessToken || undefined
    })
  }

  const setNotificationUnread = async (notificationId: string) => {
    return callApi<never, SetNotificationUnreadResponse>({
      method: "POST",
      path: `/notifications/${notificationId}/unread`,
      token: accessToken || undefined
    })
  }

  return {
    getNotifications,
    setAllNotificationsReadResponse,
    setNotificationRead,
    setNotificationUnread
  }
}
