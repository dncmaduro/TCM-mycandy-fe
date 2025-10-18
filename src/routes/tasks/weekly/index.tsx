import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppLayout } from "../../../components/layouts/app-layout"
import { DataTable } from "../../../components/common/data-table"
import { useTasks } from "../../../hooks/use-tasks"
import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { ITask, TaskPriority } from "../../../types/interfaces"
import {
  Badge,
  Button,
  Group,
  Text,
  ActionIcon,
  Stack,
  Title,
  Avatar,
  SegmentedControl,
  Divider,
  Alert,
  Paper,
  Select
} from "@mantine/core"
import {
  IconPlus,
  IconEye,
  IconTrash,
  IconTable,
  IconLayoutKanban,
  IconArrowRight,
  IconInfoCircle
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { TaskDetail } from "../../../components/tasks/task-detail"
import { TaskModal } from "../../../components/tasks/task-modal"
import { TaskFilters } from "../../../components/tasks/task-filters"
import { KanbanBoard } from "../../../components/tasks/kanban/KanbanBoard"
import { CreateTaskRequest, SearchTasksParams } from "../../../types/models"
import { useForm, FormProvider } from "react-hook-form"
import { useUsers } from "../../../hooks/use-users"
import { useTaskTags } from "../../../hooks/use-task-tags"
import { TaskTagsDisplay } from "../../../components/tasks/task-tags-display"
import { useSprints } from "../../../hooks/use-sprints"
import { Can } from "../../../components/common/Can"

export const Route = createFileRoute("/tasks/weekly/")({
  component: RouteComponent
})

interface MoveToNewSprintModalProps {
  onClose: () => void
}

function MoveToNewSprintModal({ onClose }: MoveToNewSprintModalProps) {
  const { getCurrentSprint, getSprints, moveTasksToSprint } = useSprints()
  const qc = useQueryClient()
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")

  const { data: currentSprintData, isLoading: currentSprintLoading } = useQuery(
    {
      queryKey: ["current-sprint"],
      queryFn: getCurrentSprint,
      staleTime: 60000
    }
  )

  const { data: sprintsData } = useQuery({
    queryKey: ["available-sprints"],
    queryFn: async () => {
      const resp = await getSprints({ limit: 50 })
      return resp.data
    },
    staleTime: 60000
  })

  const { mutate: handleMoveToSprint, isPending: isMoving } = useMutation({
    mutationFn: (sprintId: string) => moveTasksToSprint(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
      qc.invalidateQueries({ queryKey: ["current-sprint"] })
      notifications.show({
        title: "Thành công",
        message: "Đã chuyển các task sang sprint mới",
        color: "green"
      })
      onClose()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể chuyển sprint",
        color: "red"
      })
    }
  })

  const currentSprint = currentSprintData?.data?.sprint
  const currentStats = currentSprintData?.data?.taskStats

  const availableSprints =
    sprintsData?.data?.filter(
      (s) => !s.deletedAt && s._id !== currentSprint?._id
    ) || []

  if (currentSprintLoading) {
    return (
      <Stack align="center" py="xl">
        <Text>Đang tải thông tin sprint hiện tại...</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle />} color="blue" variant="light">
        <Text size="sm">
          <strong>Lưu ý:</strong> Các task có trạng thái "Mới", "Đang làm" và
          "Đang review" sẽ được chuyển sang sprint mới. Các task "Hoàn thành",
          "Hủy" và "Lưu trữ" sẽ giữ nguyên.
        </Text>
      </Alert>

      {currentSprint && currentStats && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Sprint hiện tại: {currentSprint.name}
          </Title>
          <Group grow>
            <div>
              <Text size="sm" c="dimmed">
                Mới
              </Text>
              <Badge variant="light" color="blue" size="lg">
                {currentStats.new}
              </Badge>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Đang làm
              </Text>
              <Badge variant="light" color="yellow" size="lg">
                {currentStats.in_progress}
              </Badge>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Đang review
              </Text>
              <Badge variant="light" color="orange" size="lg">
                {currentStats.reviewing}
              </Badge>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Hoàn thành
              </Text>
              <Badge variant="light" color="teal" size="lg">
                {currentStats.completed}
              </Badge>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Tổng cộng
              </Text>
              <Badge variant="filled" color="gray" size="lg">
                {currentStats.total}
              </Badge>
            </div>
          </Group>
        </Paper>
      )}

      <Select
        label="Chọn Sprint mới"
        placeholder="Chọn sprint để chuyển đến"
        data={availableSprints.map((sprint) => ({
          value: sprint._id,
          label: sprint.name
        }))}
        value={selectedSprintId}
        onChange={(value) => setSelectedSprintId(value || "")}
        required
        searchable
      />

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onClose}>
          Hủy
        </Button>
        <Button
          onClick={() => handleMoveToSprint(selectedSprintId)}
          disabled={!selectedSprintId || isMoving}
          loading={isMoving}
          leftSection={<IconArrowRight size={16} />}
        >
          Chuyển Sprint
        </Button>
      </Group>
    </Stack>
  )
}

function RouteComponent() {
  const { searchTasks, deleteTask, createTask } = useTasks()
  const { getSprints } = useSprints()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<
    Omit<SearchTasksParams, "page" | "limit">
  >({})
  const { publicSearchUsers } = useUsers()
  const { searchTaskTags } = useTaskTags()

  const { data: usersData } = useQuery({
    queryKey: ["public-users"],
    queryFn: () => publicSearchUsers({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const { data: tagsData } = useQuery({
    queryKey: ["active-task-tags"],
    queryFn: async () => {
      const resp = await searchTaskTags({ deleted: false, limit: 100, page: 1 })
      return resp.data
    },
    staleTime: Infinity
  })

  const { data: sprintsData } = useQuery({
    queryKey: ["sprints-list"],
    queryFn: async () => {
      const resp = await getSprints({ limit: 100 })
      return resp.data
    },
    staleTime: Infinity
  })

  const allTags = useMemo(() => {
    return tagsData?.data ?? []
  }, [tagsData])

  const sprintsMap = useMemo(() => {
    const list = sprintsData?.data ?? []
    return new Map<string, { _id: string; name: string }>(
      list.filter((s) => !s.deletedAt).map((s) => [s._id, s])
    )
  }, [sprintsData])

  const usersMap = useMemo(() => {
    const list = usersData?.data?.data ?? []
    return new Map<string, { _id: string; name: string; avatarUrl?: string }>(
      list.map((u: any) => [u._id, u])
    )
  }, [usersData])

  const usersList = useMemo(() => {
    return usersData?.data?.data ?? []
  }, [usersData])

  const sprintsList = useMemo(() => {
    return (sprintsData?.data ?? []).filter((s) => !s.deletedAt)
  }, [sprintsData])

  const handleFiltersChange = (
    newFilters: Omit<SearchTasksParams, "page" | "limit">
  ) => {
    setFilters(newFilters)
    setPage(1) // Reset về trang 1 khi thay đổi filter
  }

  const { data, isLoading } = useQuery({
    queryKey: ["tasks-weekly", page, pageSize, filters],
    queryFn: async () => {
      const resp = await searchTasks({
        page,
        limit: pageSize,
        ...filters
      })
      return resp.data
    },
    enabled: !!usersData
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
      notifications.show({
        title: "Thành công",
        message: "Đã xóa task",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể xóa task",
        color: "red"
      })
    }
  })

  const { mutate: handleCreate } = useMutation({
    mutationFn: (payload: CreateTaskRequest) => createTask(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
      notifications.show({
        title: "Thành công",
        message: "Đã tạo task mới",
        color: "green"
      })
    },
    onError: (error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tạo task",
        color: "red"
      })
    }
  })

  const openDetailModal = (task: ITask) => {
    modals.open({
      title: <b>Chi tiết Task</b>,
      size: "xl",
      children: <TaskDetail task={task} />
    })
  }

  const form = useForm<CreateTaskRequest>({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium" as TaskPriority,
      dueDate: undefined,
      assignedTo: "",
      tags: [],
      sprint: ""
    }
  })

  const openCreateModal = () => {
    const handleSubmit = async (values: CreateTaskRequest) => {
      try {
        const payload = {
          title: values.title,
          description: values.description || undefined,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
          assignedTo: values.assignedTo || undefined,
          tags: values.tags,
          sprint: values.sprint
        }
        handleCreate(payload)
        qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
        notifications.show({
          title: "Thành công",
          message: "Đã tạo task mới",
          color: "green"
        })
        modals.closeAll()
      } catch (error: any) {
        notifications.show({
          title: "Lỗi",
          message: error.message || "Không thể tạo task",
          color: "red"
        })
      }
    }

    modals.open({
      title: <b>Tạo Task mới</b>,
      size: "xl",
      children: (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <TaskModal />
          </form>
        </FormProvider>
      )
    })
  }

  const openDeleteConfirm = (task: ITask) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa task",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa task <strong>{task.title}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => handleDelete(task._id)
    })
  }

  const openMoveToNewSprintModal = () => {
    modals.open({
      title: <b>Chuyển sang Sprint mới</b>,
      size: "xl",
      children: <MoveToNewSprintModal onClose={() => modals.closeAll()} />
    })
  }

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const columns = useMemo<ColumnDef<ITask>[]>(
    () => [
      {
        header: "Tiêu đề",
        accessorKey: "title",
        cell: ({ row }) => {
          const description =
            row.original.description && row.original.description.length > 30
              ? row.original.description?.substring(0, 30) + "..."
              : row.original.description
          return (
            <div>
              <Text fw={600}>{row.original.title}</Text>
              {row.original.description && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {description}
                </Text>
              )}
            </div>
          )
        }
      },
      {
        header: "Sprint",
        accessorKey: "sprint",
        cell: ({ row }) => {
          const sprintName = sprintsMap.get(row.original.sprint)?.name
          return sprintName ? (
            <Text size="sm">{sprintName}</Text>
          ) : (
            <Text size="sm" c="dimmed">
              -
            </Text>
          )
        }
      },
      {
        header: "Người được giao",
        accessorKey: "assignedTo",
        cell: ({ row }) => {
          const uid = row.original.assignedTo
          const user = uid ? usersMap.get(uid) : undefined
          return (
            <Group gap="4">
              <Avatar size={"sm"} src={user?.avatarUrl} />
              <Text size="sm">{user?.name}</Text>
            </Group>
          )
        }
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue() as ITask["status"]
          const statusMap: Record<
            ITask["status"],
            { color: string; label: string }
          > = {
            new: { color: "blue", label: "Mới" },
            in_progress: { color: "yellow", label: "Đang làm" },
            completed: { color: "green", label: "Hoàn thành" },
            archived: { color: "gray", label: "Lưu trữ" },
            canceled: { color: "red", label: "Hủy" },
            reviewing: { color: "orange", label: "Đang review" }
          }
          const m = statusMap[status]
          return (
            <Badge color={m.color} variant="dot">
              {m.label}
            </Badge>
          )
        }
      },
      {
        header: "Ưu tiên",
        accessorKey: "priority",
        cell: ({ getValue }) => {
          const priority = getValue() as ITask["priority"]
          const priorityMap: Record<
            ITask["priority"],
            { color: string; label: string }
          > = {
            low: { color: "gray", label: "Thấp" },
            medium: { color: "blue", label: "Trung bình" },
            high: { color: "orange", label: "Cao" },
            urgent: { color: "red", label: "Khẩn cấp" }
          }
          const m = priorityMap[priority]
          return (
            <Badge color={m.color} variant="light">
              {m.label}
            </Badge>
          )
        }
      },
      {
        header: "Hạn",
        accessorKey: "dueDate",
        cell: ({ getValue }) => {
          const dueDate = getValue() as Date | null | undefined
          if (!dueDate) return <Text size="sm">-</Text>
          const date = new Date(dueDate)
          return <Text size="sm">{date.toLocaleDateString("vi-VN")}</Text>
        }
      },
      {
        header: "Thẻ",
        accessorKey: "tags",
        cell: ({ row }) => {
          return (
            <TaskTagsDisplay
              tagNames={row.original.tags || []}
              maxVisible={2}
            />
          )
        }
      },
      {
        header: "Thao tác",
        id: "actions",
        cell: ({ row }) => (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => openDetailModal(row.original)}
            >
              <IconEye size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => openDeleteConfirm(row.original)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        )
      }
    ],
    [usersMap, allTags, sprintsMap]
  )

  const viewMode = useMemo(() => {
    return [
      {
        label: "Danh sách",
        value: "list",
        icon: IconTable
      },
      {
        label: "Bảng Kanban",
        value: "kanban",
        icon: IconLayoutKanban
      }
    ]
  }, [])

  const [view, setView] = useState<"list" | "kanban">("list")

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Quản lý Task hàng tuần</Title>
          <Group>
            <Group gap={4}>
              <Text size="sm">Chế độ xem</Text>
              <SegmentedControl
                data={viewMode}
                value={view}
                onChange={(val) => setView(val as "list" | "kanban")}
                size="xs"
              />
            </Group>
            <Divider orientation="vertical" />
            <Can roles={["superadmin", "admin"]}>
              <Button
                variant="light"
                color="indigo"
                leftSection={<IconArrowRight size={18} />}
                onClick={openMoveToNewSprintModal}
              >
                Chuyển Sprint
              </Button>
            </Can>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={openCreateModal}
            >
              Thêm Task
            </Button>
          </Group>
        </Group>

        {view === "list" ? (
          <DataTable<ITask, unknown>
            columns={columns}
            data={rows}
            initialPageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            enableGlobalFilter={false}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newPageSize: number) => {
              setPageSize(newPageSize)
              setPage(1) // Reset về trang 1 khi thay đổi page size
            }}
            extraFilters={
              <TaskFilters
                onFiltersChange={handleFiltersChange}
                users={usersList}
                sprints={sprintsList}
                initialFilters={filters}
                view={view}
              />
            }
            extraActions={
              <Text c="dimmed" size="sm">
                {isLoading ? "Đang tải..." : `${rows.length} task`}
              </Text>
            }
          />
        ) : (
          <>
            {/* Filters for Kanban view */}
            <TaskFilters
              onFiltersChange={handleFiltersChange}
              users={usersList}
              sprints={sprintsList}
              initialFilters={filters}
              view={view}
            />

            {/* Kanban Board */}
            <KanbanBoard
              filters={filters}
              usersMap={usersMap}
              sprintsMap={sprintsMap}
              onViewTask={openDetailModal}
              onDeleteTask={openDeleteConfirm}
            />
          </>
        )}
      </Stack>
    </AppLayout>
  )
}
