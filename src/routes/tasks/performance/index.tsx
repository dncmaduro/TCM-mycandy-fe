import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"
import {
  Title,
  Stack,
  Group,
  Avatar,
  Text,
  Select,
  Progress
} from "@mantine/core"
import { useTasks } from "../../../hooks/use-tasks"
import { useProfile } from "../../../hooks/use-profile"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { DataTable } from "../../../components/common/data-table"
import type { ColumnDef } from "@tanstack/react-table"

export const Route = createFileRoute("/tasks/performance/")({
  component: RouteComponent
})

type SortType = "taskRatio" | "unitRatio" | "completedTasks" | "completedUnits"

type StatRow = {
  profile: {
    _id: string
    name: string
  }
  totalTasks: number
  totalUnits: number
  completedTasks: number
  completedUnits: number
  totalEstimateHours: number
}

function RouteComponent() {
  const { getAllUsersCurrentSprintStats } = useTasks()
  const { publicSearchProfiles } = useProfile()
  const [sortBy, setSortBy] = useState<SortType>("taskRatio")

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["all-users-current-sprint-stats"],
    queryFn: getAllUsersCurrentSprintStats,
    staleTime: 60000
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["public-profiles"],
    queryFn: () => publicSearchProfiles({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const usersMap = useMemo(() => {
    const list = usersData?.data?.data ?? []
    return new Map<string, any>(list.map((u) => [u._id, u]))
  }, [usersData])

  const sortedStats = useMemo(() => {
    const stats = statsData?.data?.users || []

    return [...stats].sort((a, b) => {
      const taskRatioA =
        a.totalTasks > 0 ? (a.completedTasks / a.totalTasks) * 100 : 0
      const taskRatioB =
        b.totalTasks > 0 ? (b.completedTasks / b.totalTasks) * 100 : 0
      const unitRatioA =
        a.totalUnits > 0 ? (a.completedUnits / a.totalUnits) * 100 : 0
      const unitRatioB =
        b.totalUnits > 0 ? (b.completedUnits / b.totalUnits) * 100 : 0

      switch (sortBy) {
        case "taskRatio":
          return taskRatioB - taskRatioA
        case "unitRatio":
          return unitRatioB - unitRatioA
        case "completedTasks":
          return b.completedTasks - a.completedTasks
        case "completedUnits":
          return b.completedUnits - a.completedUnits
        default:
          return 0
      }
    })
  }, [statsData, sortBy])

  const sortOptions = [
    { value: "taskRatio", label: "Tỉ lệ hoàn thành task" },
    { value: "unitRatio", label: "Tỉ lệ hoàn thành unit" },
    { value: "completedTasks", label: "Số task hoàn thành" },
    { value: "completedUnits", label: "Số unit hoàn thành" }
  ]

  const columns = useMemo<ColumnDef<StatRow>[]>(
    () => [
      {
        header: "Thành viên",
        accessorKey: "profile",
        cell: ({ row }) => {
          const user = usersMap.get(row.original.profile._id)
          return (
            <Group gap="sm">
              <Avatar src={user?.avatarUrl} radius="xl" size="sm" />
              <div>
                <Text size="sm" fw={500}>
                  {row.original.profile.name || user?.name || "Unknown"}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.accountId}
                </Text>
              </div>
            </Group>
          )
        }
      },
      {
        header: "Số task hoàn thành",
        accessorKey: "completedTasks",
        cell: ({ row }) => {
          const taskRatio =
            row.original.totalTasks > 0
              ? Math.round(
                  (row.original.completedTasks / row.original.totalTasks) * 100
                )
              : 0
          return (
            <Stack gap={4}>
              <Text size="xs" c="dimmed" ta="center">
                {row.original.completedTasks}/{row.original.totalTasks} task
              </Text>
              <Progress
                value={taskRatio}
                color={
                  taskRatio >= 70 ? "teal" : taskRatio >= 40 ? "yellow" : "blue"
                }
                size="md"
                radius="xl"
              />
            </Stack>
          )
        }
      },
      {
        header: "Tỉ lệ hoàn thành task",
        accessorKey: "taskRatio",
        cell: ({ row }) => {
          const taskRatio =
            row.original.totalTasks > 0
              ? Math.round(
                  (row.original.completedTasks / row.original.totalTasks) * 100
                )
              : 0
          return (
            <Text
              size="lg"
              fw={700}
              c={taskRatio >= 70 ? "teal" : taskRatio >= 40 ? "yellow" : "blue"}
              ta="center"
            >
              {taskRatio}%
            </Text>
          )
        }
      },
      {
        header: "Tổng số giờ ước tính",
        accessorKey: "totalEstimatedHours",
        cell: ({ row }) => {
          return (
            <Text size="lg" fw={700} ta="center">
              {row.original.totalEstimateHours} giờ
            </Text>
          )
        }
      },
      {
        header: "Số unit hoàn thành",
        accessorKey: "completedUnits",
        cell: ({ row }) => {
          const unitRatio =
            row.original.totalUnits > 0
              ? Math.round(
                  (row.original.completedUnits / row.original.totalUnits) * 100
                )
              : 0
          return (
            <Stack gap={4}>
              <Text size="xs" c="dimmed" ta="center">
                {row.original.completedUnits}/{row.original.totalUnits} unit
              </Text>
              <Progress
                value={unitRatio}
                color={
                  unitRatio >= 70 ? "teal" : unitRatio >= 40 ? "yellow" : "blue"
                }
                size="md"
                radius="xl"
              />
            </Stack>
          )
        }
      },
      {
        header: "Tỉ lệ hoàn thành unit",
        accessorKey: "unitRatio",
        cell: ({ row }) => {
          const unitRatio =
            row.original.totalUnits > 0
              ? Math.round(
                  (row.original.completedUnits / row.original.totalUnits) * 100
                )
              : 0
          return (
            <Text
              size="lg"
              fw={700}
              c={unitRatio >= 70 ? "teal" : unitRatio >= 40 ? "yellow" : "blue"}
              ta="center"
            >
              {unitRatio}%
            </Text>
          )
        }
      }
    ],
    [usersMap]
  )

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

        <DataTable<StatRow, unknown>
          columns={columns}
          data={sortedStats}
          enableGlobalFilter={false}
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          extraActions={
            <Text c="dimmed" size="sm">
              {statsLoading || usersLoading
                ? "Đang tải..."
                : `${sortedStats.length} thành viên`}
            </Text>
          }
        />
      </Stack>
    </AppLayout>
  )
}
