import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"
import {
  Title,
  Stack,
  Paper,
  Table,
  Group,
  Avatar,
  Text,
  Badge,
  Select,
  Loader,
  Center
} from "@mantine/core"
import { useTasks } from "../../../hooks/use-tasks"
import { useUsers } from "../../../hooks/use-users"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/tasks/performance/")({
  component: RouteComponent
})

type SortType = "completedRatio" | "completedCount" | "totalCount"

function RouteComponent() {
  const { getAllUsersCurrentSprintStats } = useTasks()
  const { publicSearchUsers } = useUsers()
  const [sortBy, setSortBy] = useState<SortType>("completedRatio")

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["all-users-current-sprint-stats"],
    queryFn: getAllUsersCurrentSprintStats,
    staleTime: 60000
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["public-users"],
    queryFn: () => publicSearchUsers({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const usersMap = useMemo(() => {
    const list = usersData?.data?.data ?? []
    return new Map<string, any>(list.map((u: any) => [u._id, u]))
  }, [usersData])

  const sortedStats = useMemo(() => {
    const stats = statsData?.data?.users || []

    return [...stats].sort((a, b) => {
      const totalA = a.new + a.in_progress + a.reviewing + a.completed
      const totalB = b.new + b.in_progress + b.reviewing + b.completed
      const ratioA = totalA > 0 ? (a.completed / totalA) * 100 : 0
      const ratioB = totalB > 0 ? (b.completed / totalB) * 100 : 0

      switch (sortBy) {
        case "completedRatio":
          return ratioB - ratioA
        case "completedCount":
          return b.completed - a.completed
        case "totalCount":
          return totalB - totalA
        default:
          return 0
      }
    })
  }, [statsData, sortBy])

  const isLoading = statsLoading || usersLoading

  const sortOptions = [
    { value: "completedRatio", label: "Tỉ lệ hoàn thành" },
    { value: "completedCount", label: "Số task hoàn thành" },
    { value: "totalCount", label: "Tổng số task" }
  ]

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={3}>Hiệu suất làm việc</Title>
            <Text c="dimmed" size="sm">
              Thống kê sprint hiện tại của tất cả thành viên
            </Text>
          </div>
          <Select
            label="Sắp xếp theo"
            data={sortOptions}
            value={sortBy}
            onChange={(value) => setSortBy(value as SortType)}
            style={{ width: 200 }}
          />
        </Group>

        <Paper withBorder radius="md">
          {isLoading ? (
            <Center p="xl">
              <Loader />
            </Center>
          ) : (
            <Table.ScrollContainer minWidth={700}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Thành viên</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Mới</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>
                      Đang làm
                    </Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Review</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>
                      Hoàn thành
                    </Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Tổng</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Tỉ lệ</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedStats.map((stat) => {
                    const user = usersMap.get(stat.userId)
                    const total =
                      stat.new +
                      stat.in_progress +
                      stat.reviewing +
                      stat.completed
                    const ratio =
                      total > 0 ? Math.round((stat.completed / total) * 100) : 0

                    return (
                      <Table.Tr key={stat.userId}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar
                              src={user?.avatarUrl}
                              radius="xl"
                              size="sm"
                            />
                            <div>
                              <Text size="sm" fw={500}>
                                {user?.name || "Unknown"}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {user?.email}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge variant="light" color="blue">
                            {stat.new}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge variant="light" color="yellow">
                            {stat.in_progress}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge variant="light" color="orange">
                            {stat.reviewing}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge variant="light" color="teal">
                            {stat.completed}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Text fw={600}>{total}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge
                            size="lg"
                            variant="filled"
                            color={
                              ratio >= 70
                                ? "teal"
                                : ratio >= 40
                                  ? "yellow"
                                  : "red"
                            }
                          >
                            {ratio}%
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Paper>
      </Stack>
    </AppLayout>
  )
}
