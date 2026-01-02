import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { notifications as mantineNotifications } from "@mantine/notifications"
import { useQueryClient } from "@tanstack/react-query"

export function useWSNotifications(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) return

    // Kết nối WebSocket
    const newSocket = io(
      import.meta.env.VITE_WEB_SOCKET_URL || "http://localhost:3334",
      {
        query: { token }
      }
    )

    // Lắng nghe sự kiện connect
    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected:", newSocket.id)
    })

    // Lắng nghe notification mới
    newSocket.on("notification", (notification: any) => {
      console.log("📨 New notification:", notification)

      // Thêm vào danh sách notifications
      setNotifications((prev) => [notification, ...prev])

      // Tăng unread count
      setUnreadCount((prev) => prev + 1)

      // Hiển thị toast/alert
      mantineNotifications.show({
        title: notification.title as string,
        message: notification.message as string,
        color: "blue"
      })

      qc.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData

        console.log(
          "Updating notifications cache with new notification:",
          notification
        )

        // Update the first page (most recent notifications)
        const updatedPages = [...(oldData.pages || [])]
        if (updatedPages.length > 0) {
          const firstPage = { ...updatedPages[0] }
          firstPage.data = {
            ...firstPage.data,
            data: [notification, ...(firstPage.data?.data || [])],
            unreadCount: (firstPage.data?.unreadCount || 0) + 1
          }
          updatedPages[0] = firstPage
        } else {
          // If no pages exist, create the first page
          updatedPages.push({
            data: {
              data: [notification],
              unreadCount: 1,
              totalPages: 1
            }
          })
        }

        return {
          ...oldData,
          pages: updatedPages,
          pageParams: oldData.pageParams || [1]
        }
      })
    })

    // Lắng nghe disconnect
    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected")
    })

    setSocket(newSocket)

    // Cleanup khi unmount
    return () => {
      newSocket.close()
    }
  }, [token])

  return { socket, notifications, unreadCount }
}
