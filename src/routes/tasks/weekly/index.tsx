import { createFileRoute, useNavigate } from "@tanstack/react-router"
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
  Alert,
  Paper,
  Select,
  Progress,
  Tooltip
} from "@mantine/core"
import {
  IconPlus,
  IconTrash,
  IconArrowRight,
  IconInfoCircle,
  IconChevronRight
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { TaskModal } from "../../../components/tasks/task-modal"
import { TaskFilters } from "../../../components/tasks/task-filters"
import { CreateTaskRequest, SearchTasksParams } from "../../../types/models"
import { useForm, FormProvider } from "react-hook-form"
import { useTaskTags } from "../../../hooks/use-task-tags"
import { TaskTagsDisplay } from "../../../components/tasks/task-tags-display"
import { useSprints } from "../../../hooks/use-sprints"
import { Can } from "../../../components/common/Can"
import { useProfile } from "../../../hooks/use-profile"

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
          <strong>Lưu ý:</strong> Các task chưa hoàn thành (progress {"<"} aim)
          sẽ được chuyển sang sprint mới. Các task đã hoàn thành (progress {">"}
          = aim) sẽ giữ nguyên.
        </Text>
      </Alert>

      {currentSprint && currentStats && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Sprint hiện tại: {currentSprint.name}
          </Title>
          <Text size="sm" c="dimmed" mb="sm">
            Tổng số task: {currentStats.total}
          </Text>
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
  const {
    searchTasks,
    deleteTask,
    createTask,
    updateTask: updateTaskProgress
  } = useTasks()
  const { publicSearchProfiles } = useProfile()
  const { getSprints } = useSprints()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<
    Omit<SearchTasksParams, "page" | "limit">
  >({})
  const { searchTaskTags } = useTaskTags()

  const { data: profilesData } = useQuery({
    queryKey: ["public-profiles"],
    queryFn: () => publicSearchProfiles({ limit: 300, page: 1 }),
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

  const profilesMap = useMemo(() => {
    const list = profilesData?.data?.data ?? []
    return new Map<string, { _id: string; name: string; avatarUrl?: string }>(
      list.map((u: any) => [u._id, u])
    )
  }, [profilesData])

  const profilesList = useMemo(() => {
    return profilesData?.data?.data ?? []
  }, [profilesData])

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
    enabled: !!profilesData
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
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
      qc.invalidateQueries({ queryKey: ["task-logs", response.data.task._id] })
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

  const { mutate: handleUpdateProgress } = useMutation({
    mutationFn: (payload: { taskId: string; progress: number }) =>
      updateTaskProgress(payload.taskId, { progress: payload.progress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật tiến độ task",
        color: "green"
      })
    },
    onError: (error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật tiến độ task",
        color: "red"
      })
    }
  })

  const navigate = useNavigate()

  const form = useForm<CreateTaskRequest>({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium" as TaskPriority,
      aim: 1,
      aimUnit: "task",
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
          aim: values.aim || 1,
          aimUnit: values.aimUnit || "task",
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
          assignedTo: values.assignedTo || undefined,
          tags: values.tags,
          sprint: values.sprint
        }
        handleCreate(payload)
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
  const totalPages = Math.ceil((data?.total || 0) / pageSize)

  const handlePlusOne = (id: string, progress: number) => {
    handleUpdateProgress({ taskId: id, progress: progress + 1 })
  }

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
          const sprint = row.original.sprint
          const sprintName =
            typeof sprint === "string"
              ? sprintsMap.get(sprint)?.name
              : sprint?.name
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
          const assignedTo = row.original.assignedTo
          if (!assignedTo) {
            return (
              <Text size="sm" c="dimmed">
                -
              </Text>
            )
          }

          // If assignedTo is IProfile object
          if (typeof assignedTo === "object") {
            return (
              <Group gap="4">
                <Avatar size="sm" src={assignedTo.avatarUrl} />
                <Text size="sm">{assignedTo.name || assignedTo.accountId}</Text>
              </Group>
            )
          }

          // If assignedTo is string (accountId), try to find in usersMap
          const user = profilesMap.get(assignedTo)
          return (
            <Group gap="4">
              <Avatar size="sm" src={user?.avatarUrl} />
              <Text size="sm">{user?.name || assignedTo}</Text>
            </Group>
          )
        }
      },
      {
        header: "Ước tính",
        accessorKey: "estimateHours",
        cell: ({ row }) => {
          return (
            <Text size="sm">
              {row.original.estimateHours
                ? `${row.original.estimateHours} giờ`
                : ""}
            </Text>
          )
        }
      },
      {
        header: "Tiến độ",
        accessorKey: "progress",
        cell: ({ row }) => {
          const task = row.original
          const progressPercentage =
            task.aim > 0 ? Math.round((task.progress / task.aim) * 100) : 0

          return (
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {task.progress}/{task.aim} {task.aimUnit}
                </Text>
                <Tooltip
                  label="Tăng tiến độ"
                  hidden={task.progress >= task.aim}
                >
                  <ActionIcon
                    size={"xs"}
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlusOne(task._id, task.progress)
                    }}
                    hidden={task.progress >= task.aim}
                  >
                    <IconChevronRight />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Progress
                value={progressPercentage}
                color={
                  progressPercentage >= 100
                    ? "teal"
                    : progressPercentage > 0
                      ? "yellow"
                      : "blue"
                }
                size="sm"
                radius="xl"
              />
            </Stack>
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
              color="red"
              onClick={() => openDeleteConfirm(row.original)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        )
      }
    ],
    [profilesMap, allTags, sprintsMap]
  )

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Quản lý Task hàng tuần</Title>
          <Group>
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
              users={profilesList}
              sprints={sprintsList}
              initialFilters={filters}
            />
          }
          extraActions={
            <Text c="dimmed" size="sm">
              {isLoading ? "Đang tải..." : `${rows.length} task`}
            </Text>
          }
          onRowClick={(row) => navigate({ to: `/tasks/${row.original._id}` })}
        />
      </Stack>
    </AppLayout>
  )
}
