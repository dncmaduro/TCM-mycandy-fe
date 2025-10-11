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
              label="Nhiệm vụ hôm nay"
              value="8"
              color="indigo"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconAlertCircle}
              label="Quá hạn"
              value="2"
              color="red"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconCalendarEvent}
              label="Họp hôm nay"
              value="3"
              color="teal"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={IconClockHour4}
              label="Giờ tuần này"
              value="24.5h"
              color="grape"
            />
          </Grid.Col>
        </Grid>

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
