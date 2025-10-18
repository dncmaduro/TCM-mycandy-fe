import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../../components/common/data-table"
import type { ITaskTags } from "../../../types/interfaces"
import { useTaskTags } from "../../../hooks/use-task-tags"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Select,
  ColorInput,
  Title
} from "@mantine/core"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconRotateClockwise2
} from "@tabler/icons-react"
import { useDebouncedValue } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { AppLayout } from "../../../components/layouts/app-layout"

export const Route = createFileRoute("/tasks/tags/")({
  component: RouteComponent
})

function RouteComponent() {
  const qc = useQueryClient()
  const {
    searchTaskTags,
    createTaskTag,
    updateTaskTag,
    deleteTaskTag,
    restoreTaskTag
  } = useTaskTags()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState("")
  const [deletedFilter, setDeletedFilter] = useState<
    "all" | "active" | "deleted"
  >("all")
  const [debouncedSearch] = useDebouncedValue(searchText, 400)

  const { data, isLoading } = useQuery({
    queryKey: [
      "task-tags",
      {
        page,
        limit: pageSize,
        searchText: debouncedSearch,
        deleted: deletedFilter
      }
    ],
    queryFn: async () => {
      const resp = await searchTaskTags({
        page,
        limit: pageSize,
        searchText: debouncedSearch || undefined,
        deleted:
          deletedFilter === "all" ? undefined : deletedFilter === "deleted"
      })
      return resp.data
    },
    placeholderData: keepPreviousData
  })

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const { mutate: handleCreate } = useMutation({
    mutationFn: createTaskTag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-tags"] })
      notifications.show({
        title: "Thành công",
        message: "Đã tạo thẻ",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tạo thẻ",
        color: "red"
      })
    }
  })

  const { mutate: handleUpdate } = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: { name?: string; color?: string }
    }) => updateTaskTag(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-tags"] })
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật thẻ",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật thẻ",
        color: "red"
      })
    }
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: string) => deleteTaskTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-tags"] })
      notifications.show({
        title: "Thành công",
        message: "Đã xóa thẻ",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể xóa thẻ",
        color: "red"
      })
    }
  })

  const { mutate: handleRestore } = useMutation({
    mutationFn: (id: string) => restoreTaskTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-tags"] })
      notifications.show({
        title: "Thành công",
        message: "Đã khôi phục thẻ",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể khôi phục thẻ",
        color: "red"
      })
    }
  })

  const openCreateModal = () => {
    let name = ""
    let color = "#228be6"

    modals.open({
      title: <b>Thêm thẻ mới</b>,
      children: (
        <Stack>
          <TextInput
            label="Tên thẻ"
            placeholder="Nhập tên thẻ"
            defaultValue={name}
            onChange={(e) => (name = e.currentTarget.value)}
          />
          <ColorInput
            label="Màu sắc"
            format="hex"
            defaultValue={color}
            onChange={(v) => (color = v || "#228be6")}
          />
          <Group justify="flex-end">
            <Button
              onClick={() => {
                if (!name.trim()) {
                  notifications.show({
                    title: "Thiếu thông tin",
                    message: "Vui lòng nhập tên thẻ",
                    color: "yellow"
                  })
                  return
                }
                handleCreate({ name, color })
              }}
            >
              Lưu
            </Button>
          </Group>
        </Stack>
      )
    })
  }

  const openEditModal = (tag: ITaskTags) => {
    let name = tag.name
    let color = tag.color

    modals.open({
      title: <b>Chỉnh sửa thẻ</b>,
      children: (
        <Stack>
          <TextInput
            label="Tên thẻ"
            placeholder="Nhập tên thẻ"
            defaultValue={name}
            onChange={(e) => (name = e.currentTarget.value)}
          />
          <ColorInput
            label="Màu sắc"
            format="hex"
            defaultValue={color}
            onChange={(v) => (color = v || tag.color)}
          />
          <Group justify="flex-end">
            <Button
              onClick={() => {
                if (!name.trim()) {
                  notifications.show({
                    title: "Thiếu thông tin",
                    message: "Vui lòng nhập tên thẻ",
                    color: "yellow"
                  })
                  return
                }
                handleUpdate({ id: tag._id, data: { name, color } })
              }}
            >
              Cập nhật
            </Button>
          </Group>
        </Stack>
      )
    })
  }

  const openDeleteConfirm = (tag: ITaskTags) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa thẻ",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa thẻ <b>{tag.name}</b>?
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { confirm: "Xóa", cancel: "Hủy" },
      onConfirm: () => handleDelete(tag._id)
    })
  }

  const openRestoreConfirm = (tag: ITaskTags) => {
    modals.openConfirmModal({
      title: "Khôi phục thẻ",
      children: (
        <Text size="sm">
          Khôi phục thẻ <b>{tag.name}</b>?
        </Text>
      ),
      labels: { confirm: "Khôi phục", cancel: "Hủy" },
      onConfirm: () => handleRestore(tag._id)
    })
  }

  const columns = useMemo<ColumnDef<ITaskTags, unknown>[]>(
    () => [
      {
        header: "Tên thẻ",
        accessorKey: "name",
        cell: ({ row }) => (
          <Group gap="xs">
            <Box
              w={12}
              h={12}
              style={{
                backgroundColor: row.original.color,
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.1)"
              }}
            />
            <Text fw={600}>{row.original.name}</Text>
          </Group>
        )
      },
      {
        header: "Màu",
        accessorKey: "color",
        cell: ({ getValue }) => {
          const c = getValue() as string
          return (
            <Badge
              variant="light"
              style={{ backgroundColor: c, color: "#fff" }}
            >
              {c}
            </Badge>
          )
        }
      },
      {
        header: "Trạng thái",
        id: "status",
        cell: ({ row }) => {
          const deleted = !!row.original.deletedAt
          return (
            <Badge color={deleted ? "red" : "green"} variant="light">
              {deleted ? "Đã xóa" : "Hoạt động"}
            </Badge>
          )
        }
      },
      {
        header: "Tạo lúc",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const d = getValue() as string
          const dt = new Date(d)
          return <Text size="sm">{dt.toLocaleString("vi-VN")}</Text>
        }
      },
      {
        header: "Cập nhật",
        accessorKey: "updatedAt",
        cell: ({ getValue }) => {
          const d = getValue() as string
          const dt = new Date(d)
          return <Text size="sm">{dt.toLocaleString("vi-VN")}</Text>
        }
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const deleted = !!row.original.deletedAt
          return (
            <Group gap="xs">
              {!deleted && (
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => openEditModal(row.original)}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              )}
              {!deleted ? (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => openDeleteConfirm(row.original)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              ) : (
                <ActionIcon
                  variant="subtle"
                  color="green"
                  onClick={() => openRestoreConfirm(row.original)}
                >
                  <IconRotateClockwise2 size={18} />
                </ActionIcon>
              )}
            </Group>
          )
        }
      }
    ],
    []
  )

  return (
    <AppLayout>
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Quản lý thẻ Task</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreateModal}
          >
            Thêm thẻ
          </Button>
        </Group>

        <DataTable<ITaskTags, unknown>
          columns={columns}
          data={rows}
          initialPageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          enableGlobalFilter={false}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n)
            setPage(1)
          }}
          extraFilters={
            <Group gap="xs">
              <TextInput
                placeholder="Tìm theo tên..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.currentTarget.value)
                  setPage(1)
                }}
              />
              <Select
                placeholder="Trạng thái"
                value={deletedFilter}
                onChange={(v) => {
                  setDeletedFilter((v as any) ?? "all")
                  setPage(1)
                }}
                data={[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Hoạt động" },
                  { value: "deleted", label: "Đã xóa" }
                ]}
              />
            </Group>
          }
          extraActions={
            <Text c="dimmed" size="sm">
              {isLoading ? "Đang tải..." : `${rows.length} thẻ`}
            </Text>
          }
        />
      </Stack>
    </AppLayout>
  )
}
