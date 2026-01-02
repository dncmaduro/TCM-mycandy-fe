import { useMemo, useState, useEffect, useRef } from "react"
import {
  Popover,
  ActionIcon,
  Indicator,
  Stack,
  Text,
  Group,
  Button,
  ScrollArea,
  Badge,
  Box,
  Tooltip
} from "@mantine/core"
import { IconBell, IconCheckbox } from "@tabler/icons-react"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import { useNotifications } from "../../hooks/use-notifications"
import { notifications } from "@mantine/notifications"
import type { INotification, NotificationType } from "../../types/interfaces"
import { useWSNotifications } from "../../ws/use-ws-notifications"
import { useAuthStore } from "../../stores/authState"
import { useNavigate } from "@tanstack/react-router"

export function NotificationsPopover() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [opened, setOpened] = useState(false)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUnreadCountRef = useRef<number>(0)

  const {
    getNotifications,
    setAllNotificationsReadResponse,
    setNotificationRead,
    setNotificationUnread
  } = useNotifications()

  // Fetch notifications with infinite query
  const {
    data: notificationsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ page: pageParam as number, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.page
      const typedLastPage = lastPage.data.totalPages
      return currentPage < (typedLastPage || 1) ? currentPage + 1 : undefined
    },
    staleTime: 30000,
    refetchInterval: 60000 // Refetch every minute
  })

  const notifications_list = useMemo(() => {
    return (
      notificationsData?.pages?.flatMap((page: any) => page.data?.data || []) ||
      []
    )
  }, [notificationsData])

  const unreadCount = useMemo(() => {
    const firstPage = notificationsData?.pages?.[0] as any
    return firstPage?.data?.unreadCount || 0
  }, [notificationsData])

  // Play sound when new notification arrives
  useEffect(() => {
    if (
      unreadCount > prevUnreadCountRef.current &&
      prevUnreadCountRef.current > 0
    ) {
      // New notification received - play sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore if autoplay is blocked
          console.log("Audio autoplay blocked by browser")
        })
      }
    }
    prevUnreadCountRef.current = unreadCount
  }, [unreadCount])

  // Update favicon badge when unread count changes
  useEffect(() => {
    const updateFavicon = () => {
      // Get the original favicon
      const favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement
      if (!favicon) return

      // Store original favicon URL if not already stored
      const originalFaviconUrl =
        favicon.dataset.original || favicon.href || "/vite.svg"
      if (!favicon.dataset.original) {
        favicon.dataset.original = originalFaviconUrl
      }

      // Create canvas
      const canvas = document.createElement("canvas")
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Load and draw the original favicon
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Draw original favicon
        ctx.drawImage(img, 0, 0, 32, 32)

        // Draw red badge if there are unread notifications
        if (unreadCount > 0) {
          // Draw red circle badge
          ctx.fillStyle = "#fa5252" // Red color
          ctx.strokeStyle = "#ffffff" // White border
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(24, 8, 8, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()

          // Draw count
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 10px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString()
          ctx.fillText(displayCount, 24, 8)
        }

        // Update favicon
        favicon.href = canvas.toDataURL("image/png")
      }

      img.onerror = () => {
        // Fallback: if original favicon can't be loaded, just show badge on blank
        console.warn("Could not load original favicon, using fallback")

        // Draw simple blue circle as fallback
        ctx.fillStyle = "#228be6"
        ctx.beginPath()
        ctx.arc(16, 16, 14, 0, 2 * Math.PI)
        ctx.fill()

        if (unreadCount > 0) {
          ctx.fillStyle = "#fa5252"
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(24, 8, 8, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()

          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 10px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString()
          ctx.fillText(displayCount, 24, 8)
        }

        favicon.href = canvas.toDataURL("image/png")
      }

      // Load the original favicon
      img.src = originalFaviconUrl
    }

    updateFavicon()
  }, [unreadCount])

  // Initialize audio on mount
  useEffect(() => {
    // Create a simple beep sound using Web Audio API as fallback
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()

    const createNotificationSound = () => {
      const currentTime = audioContext.currentTime

      // First tone: 800Hz for 0.2s
      const oscillator1 = audioContext.createOscillator()
      const gainNode1 = audioContext.createGain()

      oscillator1.connect(gainNode1)
      gainNode1.connect(audioContext.destination)

      oscillator1.frequency.value = 800
      oscillator1.type = "sine"

      gainNode1.gain.setValueAtTime(0.3, currentTime)
      gainNode1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2)

      oscillator1.start(currentTime)
      oscillator1.stop(currentTime + 0.2)

      // Second tone: 900Hz for 0.2s, starting after first tone
      const oscillator2 = audioContext.createOscillator()
      const gainNode2 = audioContext.createGain()

      oscillator2.connect(gainNode2)
      gainNode2.connect(audioContext.destination)

      oscillator2.frequency.value = 900
      oscillator2.type = "sine"

      gainNode2.gain.setValueAtTime(0.3, currentTime + 0.2)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4)

      oscillator2.start(currentTime + 0.2)
      oscillator2.stop(currentTime + 0.4)
    }

    // Store the sound generator function
    if (!audioRef.current) {
      audioRef.current = {
        play: () => {
          try {
            createNotificationSound()
            return Promise.resolve()
          } catch (e) {
            return Promise.reject(e)
          }
        }
      } as any
    }
  }, [])

  // Mark all as read mutation
  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } = useMutation({
    mutationFn: setAllNotificationsReadResponse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
      notifications.show({
        title: "Thành công",
        message: "Đã đánh dấu tất cả thông báo là đã đọc",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể đánh dấu thông báo",
        color: "red"
      })
    }
  })

  // Mark single notification as read/unread
  const { mutate: toggleNotificationRead } = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      isRead ? setNotificationUnread(id) : setNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật thông báo",
        color: "red"
      })
    }
  })

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "task_assigned":
      case "task_updated":
      case "task_status_changed":
        return "📋"
      case "comment_mentioned":
      case "comment_added":
        return "💬"
      case "task_due_soon":
        return "⏰"
      case "time_request_approved":
        return "✅"
      case "time_request_rejected":
        return "❌"
      case "time_request_added":
        return "📝"
      case "sprint_started":
        return "🚀"
      case "new_user":
        return "👤"
      default:
        return "🔔"
    }
  }

  const formatNotificationTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} ngày trước`
    if (hours > 0) return `${hours} giờ trước`
    if (minutes > 0) return `${minutes} phút trước`
    return "Vừa xong"
  }

  const handleNotificationClick = (notification: INotification) => {
    // Mark as read first
    if (!notification.isRead) {
      toggleNotificationRead({
        id: notification._id,
        isRead: notification.isRead
      })
    }

    // Navigate based on notification type
    const { type } = notification

    switch (type) {
      case "task_assigned":
      case "task_updated":
      case "task_status_changed":
      case "task_due_soon":
        navigate({ to: "/tasks/weekly" })
        setOpened(false)
        break

      case "comment_mentioned":
      case "comment_added":
        navigate({ to: "/tasks/weekly" })
        setOpened(false)
        break

      case "time_request_approved":
      case "time_request_rejected":
        navigate({ to: "/time-tracking/requests" })
        setOpened(false)
        break

      case "time_request_added":
        // For managers - go to pending review
        navigate({ to: "/time-tracking/pending-review" })
        setOpened(false)
        break

      case "sprint_started":
        navigate({ to: "/tasks/sprints" })
        setOpened(false)
        break

      case "new_user":
        navigate({ to: "/management/user-management" })
        setOpened(false)
        break

      default:
        // Just mark as read, no navigation
        break
    }
  }

  useWSNotifications(accessToken || "")

  return (
    <Popover
      width={400}
      position="bottom-end"
      withArrow
      shadow="lg"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Tooltip label="Thông báo" withArrow>
          <Indicator
            position="top-end"
            offset={8}
            size={16}
            color="red"
            withBorder
            disabled={unreadCount === 0}
            label={unreadCount > 99 ? "99+" : unreadCount || undefined}
          >
            <ActionIcon
              variant="subtle"
              aria-label="Notifications"
              radius="xl"
              size={36}
              onClick={() => setOpened((o) => !o)}
            >
              <IconBell size={20} />
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box
          p="md"
          style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Group justify="space-between" align="center">
            <Text fw={600} size="md">
              Thông báo
            </Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconCheckbox size={14} />}
                onClick={() => markAllAsRead()}
                loading={isMarkingAllAsRead}
              >
                Đánh dấu tất cả
              </Button>
            )}
          </Group>
        </Box>

        <ScrollArea.Autosize
          mah={400}
          mx="auto"
          onScrollPositionChange={() => {
            // Trigger load more when near bottom
            const scrollElement = document.querySelector(
              "[data-radix-scroll-area-viewport]"
            )
            if (scrollElement) {
              const { scrollHeight, scrollTop, clientHeight } = scrollElement
              if (
                scrollHeight - scrollTop - clientHeight < 100 &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage()
              }
            }
          }}
        >
          {isLoading ? (
            <Box p="md">
              <Text c="dimmed" ta="center">
                Đang tải...
              </Text>
            </Box>
          ) : notifications_list.length === 0 ? (
            <Box p="xl">
              <Text c="dimmed" ta="center">
                Không có thông báo nào
              </Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {notifications_list.map((notification: INotification) => (
                <Box
                  key={notification._id}
                  p="md"
                  style={{
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "var(--mantine-color-blue-0)",
                    borderBottom: "1px solid var(--mantine-color-gray-1)",
                    cursor: "pointer"
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Text size="lg" style={{ marginTop: 2 }}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Text size="sm" fw={500} lineClamp={2}>
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <Badge size="xs" color="blue" variant="filled">
                            Mới
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.message}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatNotificationTime(notification.createdAt)}
                      </Text>
                    </Stack>
                  </Group>
                </Box>
              ))}
            </Stack>
          )}

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <Box p="md" ta="center">
              <Text size="sm" c="dimmed">
                Đang tải thêm...
              </Text>
            </Box>
          )}
        </ScrollArea.Autosize>

        {notifications_list.length > 0 && (
          <Box
            p="sm"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Button variant="subtle" size="sm" fullWidth>
              Xem tất cả thông báo
            </Button>
          </Box>
        )}
      </Popover.Dropdown>
    </Popover>
  )
}
