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
  IconAlertCircle,
  IconCalendarEvent,
  IconClockHour4,
  IconChevronRight,
  IconCheck
} from "@tabler/icons-react"
import { useMemo, type ElementType } from "react"
import { useTasks } from "../../hooks/use-tasks"
import { useQuery } from "@tanstack/react-query"
import { useUsers } from "../../hooks/use-users"
import { useTimeRequests } from "../../hooks/use-time-requests"

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
  const { getMe } = useUsers()
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: Infinity,
    select: (data) => data.data.user
  })
  const { getOwnTimeRequestsByMonth } = useTimeRequests()
  const { getMyCurrentSprintStats, searchTasks } = useTasks()
  const { data: statsData } = useQuery({
    queryKey: ["my-current-sprint-stats"],
    queryFn: getMyCurrentSprintStats,
    staleTime: 60000 // 1 minute
  })

  const { data: inProgressTasks } = useQuery({
    queryKey: ["my-in-progress-tasks"],
    queryFn: () =>
      searchTasks({
        status: "in_progress",
        limit: 3,
        page: 1,
        assignedTo: meData?._id
      }),
    staleTime: 60000,
    select: (data) => data.data.data,
    enabled: !!meData
  })

  const { data: reviewingTasks } = useQuery({
    queryKey: ["my-reviewing-tasks"],
    queryFn: () =>
      searchTasks({
        status: "reviewing",
        limit: 3,
        page: 1,
        assignedTo: meData?._id
      }),
    staleTime: 60000,
    select: (data) => data.data.data,
    enabled: !!meData
  })

  const { data: newTasks } = useQuery({
    queryKey: ["my-new-tasks"],
    queryFn: () =>
      searchTasks({
        status: "new",
        limit: 3,
        page: 1,
        assignedTo: meData?._id
      }),
    staleTime: 60000,
    select: (data) => data.data.data,
    enabled: !!meData
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

  const stats = statsData?.data || {
    new: 0,
    in_progress: 0,
    reviewing: 0,
    completed: 0
  }

  const totalTasks =
    stats.new + stats.in_progress + stats.reviewing + stats.completed
  const completedPercentage =
    totalTasks > 0 ? Math.round((stats.completed / totalTasks) * 100) : 0

  const tasks = useMemo(() => {
    const currentTasks = []
    if (inProgressTasks && inProgressTasks.length >= 3) {
      currentTasks.push(...inProgressTasks.slice(0, 3))
      return currentTasks
    } else if (inProgressTasks) {
      currentTasks.push(...inProgressTasks)
    }

    if (currentTasks.length < 3) {
      const remainingSlots = 3 - currentTasks.length
      if (reviewingTasks && reviewingTasks.length >= remainingSlots) {
        currentTasks.push(...reviewingTasks.slice(0, remainingSlots))
        return currentTasks
      } else if (reviewingTasks) {
        currentTasks.push(...reviewingTasks)
      }
    }

    if (currentTasks.length < 3) {
      const remainingSlots = 3 - currentTasks.length
      if (newTasks && newTasks.length >= remainingSlots) {
        currentTasks.push(...newTasks.slice(0, remainingSlots))
      } else if (newTasks) {
        currentTasks.push(...newTasks)
      }
    }

    return currentTasks
  }, [inProgressTasks, reviewingTasks, newTasks])

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
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconListCheck}
              label="Tổng task sprint"
              value={totalTasks.toString()}
              color="indigo"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconClockHour4}
              label="Đang làm"
              value={stats.in_progress.toString()}
              color="yellow"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconAlertCircle}
              label="Đang review"
              value={stats.reviewing.toString()}
              color="orange"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconCheck}
              label="Hoàn thành"
              value={stats.completed.toString()}
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
                {stats.completed}/{totalTasks} tasks hoàn thành
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
                <Title order={4}>Task của tôi</Title>
                <Anchor size="sm" c="indigo">
                  <Link to="/tasks/weekly">Xem tất cả</Link>
                </Anchor>
              </Group>
              <Stack>
                {tasks.map((t) => (
                  <Paper key={t.title} p="sm" radius="md" withBorder>
                    <Group justify="space-between" align="center" mb={6}>
                      <Text fw={600}>{t.title}</Text>
                      <Badge
                        color={
                          t.status === "in_progress"
                            ? "teal"
                            : t.status === "reviewing"
                              ? "orange"
                              : "indigo"
                        }
                        variant="light"
                      >
                        {t.status === "in_progress"
                          ? "Đang làm"
                          : t.status === "reviewing"
                            ? "Đang review"
                            : "Mới"}
                      </Badge>
                    </Group>
                    <Progress
                      value={
                        t.status === "in_progress"
                          ? 50
                          : t.status === "reviewing"
                            ? 75
                            : 0
                      }
                      color={
                        t.status === "in_progress"
                          ? "teal"
                          : t.status === "reviewing"
                            ? "orange"
                            : "indigo"
                      }
                      radius="xl"
                    />
                  </Paper>
                ))}
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
              <Title order={4} mb="sm">
                Theo dõi thời gian
              </Title>
              <Text size="sm" c="dimmed" mb={6}>
                24.5/40 giờ tuần này
              </Text>
              <Progress value={61} color="grape" radius="xl" mb="sm" />
              <Group gap="xs">
                <ThemeIcon size={22} radius="xl" color="teal" variant="light">
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text size="sm">
                  {requestsCount?.approvedCount}/{requestsCount?.total} yêu cầu
                  duyệt
                </Text>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider />

        <Group wrap="wrap" gap="md">
          <Paper withBorder p="md" radius="md" style={{ flex: "1 1 320px" }}>
            <Title order={5} mb="xs">
              Thông báo gần đây
            </Title>
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon size={18} radius="xl" color="indigo" variant="light">
                  <IconListCheck size={12} />
                </ThemeIcon>
                <Text size="sm">Điểm danh tháng 10 đã mở</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size={18} radius="xl" color="red" variant="light">
                  <IconAlertCircle size={12} />
                </ThemeIcon>
                <Text size="sm">Cập nhật chính sách nghỉ phép</Text>
              </Group>
            </Stack>
          </Paper>
        </Group>
      </Stack>
    </AppLayout>
  )
}
