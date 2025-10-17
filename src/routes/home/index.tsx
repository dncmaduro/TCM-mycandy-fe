import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
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
import type { ElementType } from "react"
import { useAuthStore } from "../../stores/authState"
import { useTasks } from "../../hooks/use-tasks"
import { useQuery } from "@tanstack/react-query"

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
  const user = useAuthStore((s) => s.user)
  const { getMyCurrentSprintStats } = useTasks()

  const { data: statsData } = useQuery({
    queryKey: ["my-current-sprint-stats"],
    queryFn: getMyCurrentSprintStats,
    staleTime: 60000 // 1 minute
  })

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

  const tasks = [
    { title: "Thiết kế UI trang login", progress: 85, status: "Đang làm" },
    { title: "Tối ưu refresh token", progress: 60, status: "Đang làm" },
    { title: "Review PR #42", progress: 100, status: "Hoàn thành" }
  ]

  const meetings = [
    { time: "09:30", title: "Daily Standup" },
    { time: "14:00", title: "Sync với Marketing" },
    { time: "16:30", title: "Retro Sprint" }
  ]

  return (
    <AppLayout>
      <Stack gap="md">
        <div>
          <Title order={2}>Xin chào, {user?.name ?? "bạn"}</Title>
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
                <Title order={4}>Nhiệm vụ của tôi</Title>
                <Anchor size="sm" c="indigo" href="#">
                  Xem tất cả
                </Anchor>
              </Group>
              <Stack>
                {tasks.map((t) => (
                  <Paper key={t.title} p="sm" radius="md" withBorder>
                    <Group justify="space-between" align="center" mb={6}>
                      <Text fw={600}>{t.title}</Text>
                      <Badge
                        color={t.progress === 100 ? "teal" : "indigo"}
                        variant="light"
                      >
                        {t.status}
                      </Badge>
                    </Group>
                    <Progress
                      value={t.progress}
                      color={t.progress === 100 ? "teal" : "indigo"}
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
                <Text size="sm">3 yêu cầu duyệt</Text>
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
