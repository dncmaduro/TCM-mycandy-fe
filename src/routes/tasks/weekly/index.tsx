import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppLayout } from "../../../components/layouts/AppLayout"
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
  Avatar
} from "@mantine/core"
import { IconPlus, IconEye, IconTrash } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { TaskDetail } from "../../../components/tasks/task-detail"
import { TaskModal } from "../../../components/tasks/task-modal"
import { TaskFilters } from "../../../components/tasks/task-filters"
import { CreateTaskRequest, SearchTasksParams } from "../../../types/models"
import { useForm, FormProvider } from "react-hook-form"
import { useUsers } from "../../../hooks/use-users"

export const Route = createFileRoute("/tasks/weekly/")({
  component: RouteComponent
})

function RouteComponent() {
  const { searchTasks, deleteTask, createTask } = useTasks()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<
    Omit<SearchTasksParams, "page" | "limit">
  >({})
  const { publicSearchUsers } = useUsers()

  const { data: usersData } = useQuery({
    queryKey: ["public-users"],
    queryFn: () => publicSearchUsers({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const usersMap = useMemo(() => {
    const list = usersData?.data?.data ?? []
    return new Map<string, { _id: string; name: string; avatarUrl?: string }>(
      list.map((u: any) => [u._id, u])
    )
  }, [usersData])

  const usersList = useMemo(() => {
    return usersData?.data?.data ?? []
  }, [usersData])

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
      tags: []
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
          tags: values.tags
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

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const columns = useMemo<ColumnDef<ITask, unknown>[]>(
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
    [usersMap]
  )

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Quản lý Task hàng tuần</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreateModal}
          >
            Thêm Task
          </Button>
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
              users={usersList}
              initialFilters={filters}
            />
          }
          extraActions={
            <Text c="dimmed" size="sm">
              {isLoading ? "Đang tải..." : `${rows.length} task`}
            </Text>
          }
        />
      </Stack>
    </AppLayout>
  )
}
