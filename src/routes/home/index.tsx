import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/app-layout"
import {
  Title,
  Text,
  Stack,
  Paper,
  Grid,
  Group,
  Badge,
  Progress,
  ThemeIcon,
  Divider,
  Anchor
} from "@mantine/core"
import {
  IconListCheck,
  IconCalendarEvent,
  IconClockHour4,
  IconChevronRight,
  IconCheck,
  IconBell,
  IconBellRinging
} from "@tabler/icons-react"
import { useMemo, type ElementType } from "react"
import { useTasks } from "../../hooks/use-tasks"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTimeRequests } from "../../hooks/use-time-requests"
import { useProfile } from "../../hooks/use-profile"
import { useNotifications } from "../../hooks/use-notifications"
import { useSprints } from "../../hooks/use-sprints"

export const Route = createFileRoute("/home/")({
  component: RouteComponent
})

function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="center">
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Title order={3}>{value}</Title>
        </Stack>
        <ThemeIcon radius="xl" size={40} color={color} variant="light">
          <Icon size={20} />
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

function RouteComponent() {
  const qc = useQueryClient()
  const { getMyProfile } = useProfile()
  const { data: meData } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
    staleTime: Infinity,
    select: (data) => data.data.profile
  })
  const { getOwnTimeRequestsByMonth } = useTimeRequests()
  const { searchTasks } = useTasks()
  const { getNotifications, setNotificationRead } = useNotifications()
  const { getCurrentSprint } = useSprints()

  // Get current sprint info
  const { data: currentSprintData } = useQuery({
    queryKey: ["current-sprint"],
    queryFn: getCurrentSprint,
    staleTime: 300000, // 5 minutes
    select: (data) => data.data
  })

  const currentSprint = currentSprintData?.sprint

  // Get all my tasks in current sprint
  const { data: myTasks } = useQuery({
    queryKey: ["my-sprint-tasks", currentSprint?._id],
    queryFn: () =>
      searchTasks({
        limit: 100,
        page: 1,
        assignedTo: meData?.accountId,
        sprint: currentSprint?._id
      }),
    staleTime: 60000,
    select: (data) => data.data.data,
    enabled: !!meData && !!currentSprint
  })

  // Get notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["home-notifications"],
    queryFn: () =>
      getNotifications({
        page: 1,
        limit: 5,
        isRead: false
      }),
    staleTime: 60000,
    select: (data) => data.data
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: setNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["home-notifications"] })
    }
  })

  const { data: ownTimeRequestsByMonth } = useQuery({
    queryKey: ["my-time-requests-this-month"],
    queryFn: getOwnTimeRequestsByMonth,
    staleTime: 60000,
    select: (data) => data.data.requests,
    enabled: !!meData
  })

  const requestsCount = useMemo(() => {
    const total = ownTimeRequestsByMonth?.length || 0
    const approvedCount = ownTimeRequestsByMonth?.filter(
      (req) => req.status === "approved"
    ).length
    return { total, approvedCount }
  }, [ownTimeRequestsByMonth])

  const stats = useMemo(() => {
    if (!myTasks || myTasks.length === 0) {
      return {
        total: 0,
        totalUnits: 0,
        completedUnits: 0,
        totalEstimateHours: 0
      }
    }

    const total = myTasks.length
    const totalUnits = myTasks.reduce((sum, t) => sum + t.aim, 0)
    const completedUnits = myTasks.reduce((sum, t) => sum + t.progress, 0)
    const totalEstimateHours = myTasks.reduce(
      (sum, t) => sum + (t.estimateHours || 0),
      0
    )

    return {
      total,
      totalUnits,
      completedUnits,
      totalEstimateHours
    }
  }, [myTasks])

  const completedPercentage =
    stats.totalUnits > 0
      ? Math.round((stats.completedUnits / stats.totalUnits) * 100)
      : 0

  // Get 3 tasks with lowest completion percentage
  const tasks = useMemo(() => {
    if (!myTasks) return []

    const tasksWithPercentage = myTasks
      .map((t) => ({
        ...t,
        percentage: t.aim > 0 ? Math.round((t.progress / t.aim) * 100) : 0
      }))
      .filter((t) => t.percentage < 100) // Only incomplete tasks
      .sort((a, b) => a.percentage - b.percentage) // Sort by lowest percentage
      .slice(0, 3) // Top 3

    return tasksWithPercentage
  }, [myTasks])

  const meetings = [
    { time: "09:30", title: "Daily Standup" },
    { time: "14:00", title: "Sync với Marketing" },
    { time: "16:30", title: "Retro Sprint" }
  ]

  return (
    <AppLayout>
      <Stack gap="md">
        <div>
          <Title order={2}>Xin chào, {meData?.name}</Title>
          <Text c="dimmed">Chúc bạn một ngày làm việc hiệu quả.</Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard
              icon={IconListCheck}
              label="Tổng task sprint"
              value={stats.total.toString()}
              color="indigo"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard
              icon={IconClockHour4}
              label="Tổng units"
              value={`${stats.completedUnits}/${stats.totalUnits}`}
              color="blue"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard
              icon={IconCheck}
              label="Hoàn thành"
              value={`${completedPercentage}%`}
              color="teal"
            />
          </Grid.Col>
        </Grid>

        {/* Performance Progress */}
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="sm">
            <div>
              <Title order={4}>Hiệu suất sprint hiện tại</Title>
              <Text size="sm" c="dimmed">
                {stats.completedUnits}/{stats.totalUnits} units hoàn thành
              </Text>
            </div>
            <Badge
              size="lg"
              variant="light"
              color={
                completedPercentage >= 70
                  ? "teal"
                  : completedPercentage >= 40
                    ? "yellow"
                    : "red"
              }
            >
              {completedPercentage}%
            </Badge>
          </Group>
          <Progress
            value={completedPercentage}
            color={
              completedPercentage >= 70
                ? "teal"
                : completedPercentage >= 40
                  ? "yellow"
                  : "red"
            }
            size="lg"
            radius="xl"
          />
        </Paper>

        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" align="center" mb="sm">
                <Title order={4}>Task cần ưu tiên</Title>
                <Anchor size="sm" c="indigo">
                  <Link to="/tasks/weekly">Xem tất cả</Link>
                </Anchor>
              </Group>
              <Text size="xs" c="dimmed" mb="md">
                3 task có % hoàn thành thấp nhất
              </Text>
              <Stack>
                {tasks.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    Không có task nào hoặc tất cả đã hoàn thành! 🎉
                  </Text>
                ) : (
                  tasks.map((t) => (
                    <Paper key={t._id} p="sm" radius="md" withBorder>
                      <Group justify="space-between" align="center" mb={6}>
                        <Text fw={600} lineClamp={1}>
                          {t.title}
                        </Text>
                        <Badge
                          color={
                            t.percentage >= 70
                              ? "teal"
                              : t.percentage >= 40
                                ? "yellow"
                                : "red"
                          }
                          variant="light"
                        >
                          {t.percentage}%
                        </Badge>
                      </Group>
                      <Group justify="space-between" align="center" mb={4}>
                        <Text size="xs" c="dimmed">
                          {t.progress}/{t.aim} {t.aimUnit}
                        </Text>
                        {t.estimateHours && (
                          <Text size="xs" c="dimmed">
                            ~{t.estimateHours}h
                          </Text>
                        )}
                      </Group>
                      <Progress
                        value={t.percentage}
                        color={
                          t.percentage >= 70
                            ? "teal"
                            : t.percentage >= 40
                              ? "yellow"
                              : "red"
                        }
                        radius="xl"
                      />
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper withBorder p="md" radius="md" mb="md">
              <Group justify="space-between" align="center" mb="sm">
                <Title order={4}>Lịch hôm nay</Title>
                <Group gap={4} c="indigo" style={{ cursor: "pointer" }}>
                  <Text size="sm">Mở lịch</Text>
                  <IconChevronRight size={16} />
                </Group>
              </Group>
              <Stack gap="sm">
                {meetings.map((m) => (
                  <Group key={m.title} justify="space-between" align="center">
                    <Group gap="xs" align="center">
                      <ThemeIcon
                        radius="sm"
                        size={26}
                        color="gray"
                        variant="light"
                      >
                        <IconCalendarEvent size={16} />
                      </ThemeIcon>
                      <Text fw={600}>{m.title}</Text>
                    </Group>
                    <Badge variant="light" color="gray">
                      {m.time}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" align="center" mb="sm">
                <Title order={4}>Workload sprint</Title>
              </Group>
              <Text size="sm" c="dimmed" mb={6}>
                Tổng estimate: {stats.totalEstimateHours}h / 48h (6 ngày làm
                việc)
              </Text>
              <Progress
                value={Math.min((stats.totalEstimateHours / 48) * 100, 100)}
                color={
                  stats.totalEstimateHours / 48 >= 0.9
                    ? "red"
                    : stats.totalEstimateHours / 48 >= 0.7
                      ? "yellow"
                      : "teal"
                }
                radius="xl"
                size="lg"
                mb="sm"
              />
              <Group gap="xs">
                <ThemeIcon size={22} radius="xl" color="teal" variant="light">
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text size="sm">
                  {requestsCount?.approvedCount}/{requestsCount?.total} yêu cầu
                  thời gian tháng này
                </Text>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider />

        <Group wrap="wrap" gap="md">
          <Paper withBorder p="md" radius="md" style={{ flex: "1 1 320px" }}>
            <Group justify="space-between" align="center" mb="xs">
              <Title order={5}>Thông báo gần đây</Title>
              {notificationsData && notificationsData.unreadCount > 0 && (
                <Badge color="red" variant="filled" size="sm">
                  {notificationsData.unreadCount}
                </Badge>
              )}
            </Group>
            <Stack gap="xs">
              {!notificationsData || notificationsData.data.length === 0 ? (
                <Group gap="xs" py="sm">
                  <ThemeIcon size={18} radius="xl" color="gray" variant="light">
                    <IconBell size={12} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    Không có thông báo mới
                  </Text>
                </Group>
              ) : (
                notificationsData.data.map((notification) => (
                  <Group
                    key={notification._id}
                    gap="xs"
                    style={{ cursor: "pointer" }}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <ThemeIcon
                      size={18}
                      radius="xl"
                      color={
                        notification.type === "task_assigned"
                          ? "blue"
                          : notification.type === "comment_added" ||
                              notification.type === "comment_mentioned"
                            ? "green"
                            : notification.type === "time_request_approved"
                              ? "teal"
                              : notification.type === "time_request_rejected"
                                ? "red"
                                : "indigo"
                      }
                      variant="light"
                    >
                      {notification.type === "task_assigned" ||
                      notification.type === "task_updated" ? (
                        <IconListCheck size={12} />
                      ) : notification.type === "time_request_approved" ||
                        notification.type === "time_request_rejected" ? (
                        <IconClockHour4 size={12} />
                      ) : (
                        <IconBellRinging size={12} />
                      )}
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" lineClamp={2}>
                        {notification.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(notification.createdAt).toLocaleString(
                          "vi-VN",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }
                        )}
                      </Text>
                    </div>
                  </Group>
                ))
              )}
            </Stack>
          </Paper>
        </Group>
      </Stack>
    </AppLayout>
  )
}
