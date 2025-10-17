import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../../components/common/data-table"
import type { ISprint } from "../../../types/interfaces"
import { useSprints } from "../../../hooks/use-sprints"
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Select,
  Title,
  Divider
} from "@mantine/core"
import {
  IconPlus,
  IconEye,
  IconTrash,
  IconRotateClockwise2,
  IconStar
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { DateInput } from "@mantine/dates"
import { Can } from "../../../components/common/Can"

export const Route = createFileRoute("/tasks/sprints/")({
  component: RouteComponent
})

function RouteComponent() {
  const qc = useQueryClient()
  const {
    getSprints,
    createSprint,
    deleteSprint,
    restoreSprint,
    setCurrentSprint
  } = useSprints()

  const [deletedFilter, setDeletedFilter] = useState<
    "all" | "active" | "deleted"
  >("all")

  const { data, isLoading } = useQuery({
    queryKey: ["sprints"],
    queryFn: async () => {
      const resp = await getSprints({ limit: 100 })
      return resp.data
    },
    staleTime: Infinity
  })

  const allSprints = useMemo(() => {
    return data?.data ?? []
  }, [data])

  const filteredSprints = useMemo(() => {
    if (deletedFilter === "all") return allSprints
    if (deletedFilter === "deleted")
      return allSprints.filter((s) => !!s.deletedAt)
    return allSprints.filter((s) => !s.deletedAt)
  }, [allSprints, deletedFilter])

  const { mutate: handleCreate } = useMutation({
    mutationFn: createSprint,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] })
      notifications.show({
        title: "Thành công",
        message: "Đã tạo sprint",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tạo sprint",
        color: "red"
      })
    }
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: string) => deleteSprint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] })
      notifications.show({
        title: "Thành công",
        message: "Đã xóa sprint",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể xóa sprint",
        color: "red"
      })
    }
  })

  const { mutate: handleRestore } = useMutation({
    mutationFn: (id: string) => restoreSprint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] })
      notifications.show({
        title: "Thành công",
        message: "Đã khôi phục sprint",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể khôi phục sprint",
        color: "red"
      })
    }
  })

  const { mutate: handleSetCurrent } = useMutation({
    mutationFn: (id: string) => setCurrentSprint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] })
      notifications.show({
        title: "Thành công",
        message: "Đã đặt làm sprint hiện tại",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể đặt làm sprint hiện tại",
        color: "red"
      })
    }
  })

  const openCreateModal = () => {
    let name = ""
    let startDate: Date | null = null
    let endDate: Date | null = null

    modals.open({
      title: <b>Tạo Sprint mới</b>,
      size: "xl",
      children: (
        <Stack>
          <TextInput
            label="Tên Sprint"
            placeholder="Nhập tên sprint"
            defaultValue={name}
            onChange={(e) => (name = e.currentTarget.value)}
            required
          />
          <DateInput
            label="Ngày bắt đầu"
            placeholder="Chọn ngày bắt đầu"
            valueFormat="DD/MM/YYYY"
            defaultValue={startDate}
            onChange={(v) => (startDate = v)}
            required
          />
          <DateInput
            label="Ngày kết thúc"
            placeholder="Chọn ngày kết thúc"
            valueFormat="DD/MM/YYYY"
            defaultValue={endDate}
            onChange={(v) => (endDate = v)}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => modals.closeAll()}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!name.trim()) {
                  notifications.show({
                    title: "Thiếu thông tin",
                    message: "Vui lòng nhập tên sprint",
                    color: "yellow"
                  })
                  return
                }
                if (!startDate || !endDate) {
                  notifications.show({
                    title: "Thiếu thông tin",
                    message: "Vui lòng chọn ngày bắt đầu và kết thúc",
                    color: "yellow"
                  })
                  return
                }
                if (startDate >= endDate) {
                  notifications.show({
                    title: "Lỗi",
                    message: "Ngày kết thúc phải sau ngày bắt đầu",
                    color: "red"
                  })
                  return
                }
                handleCreate({ name, startDate, endDate })
              }}
            >
              Tạo
            </Button>
          </Group>
        </Stack>
      )
    })
  }

  const openDetailModal = (sprint: ISprint) => {
    modals.open({
      title: <b>Chi tiết Sprint</b>,
      size: "xl",
      children: (
        <Stack gap="md">
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Tên Sprint
            </Text>
            <Text size="lg" fw={700}>
              {sprint.name}
            </Text>
          </div>

          <Divider />

          <Group grow>
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Ngày bắt đầu
              </Text>
              <Text fw={500}>
                {new Date(sprint.startDate).toLocaleDateString("vi-VN")}
              </Text>
            </div>
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Ngày kết thúc
              </Text>
              <Text fw={500}>
                {new Date(sprint.endDate).toLocaleDateString("vi-VN")}
              </Text>
            </div>
          </Group>

          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Trạng thái
            </Text>
            <Badge
              color={sprint.deletedAt ? "red" : "green"}
              variant="light"
              size="lg"
            >
              {sprint.deletedAt ? "Đã xóa" : "Hoạt động"}
            </Badge>
          </div>

          <Divider />

          <Group grow>
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Ngày tạo
              </Text>
              <Text size="sm">
                {new Date(sprint.createdAt).toLocaleString("vi-VN")}
              </Text>
            </div>
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Cập nhật lần cuối
              </Text>
              <Text size="sm">
                {new Date(sprint.updatedAt).toLocaleString("vi-VN")}
              </Text>
            </div>
          </Group>

          {sprint.deletedAt && (
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Xóa lúc
              </Text>
              <Text size="sm">
                {new Date(sprint.deletedAt).toLocaleString("vi-VN")}
              </Text>
            </div>
          )}
        </Stack>
      )
    })
  }

  const openDeleteConfirm = (sprint: ISprint) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa sprint",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa sprint <b>{sprint.name}</b>?
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { confirm: "Xóa", cancel: "Hủy" },
      onConfirm: () => handleDelete(sprint._id)
    })
  }

  const openRestoreConfirm = (sprint: ISprint) => {
    modals.openConfirmModal({
      title: "Khôi phục sprint",
      children: (
        <Text size="sm">
          Khôi phục sprint <b>{sprint.name}</b>?
        </Text>
      ),
      labels: { confirm: "Khôi phục", cancel: "Hủy" },
      onConfirm: () => handleRestore(sprint._id)
    })
  }

  const openSetCurrentConfirm = (sprint: ISprint) => {
    modals.openConfirmModal({
      title: "Đặt làm Sprint hiện tại",
      children: (
        <Text size="sm">
          Đặt <b>{sprint.name}</b> làm sprint hiện tại?
        </Text>
      ),
      labels: { confirm: "Đặt làm hiện tại", cancel: "Hủy" },
      onConfirm: () => handleSetCurrent(sprint._id)
    })
  }

  const columns = useMemo<ColumnDef<ISprint, unknown>[]>(
    () => [
      {
        header: "Tên Sprint",
        accessorKey: "name",
        cell: ({ row }) => <Text fw={600}>{row.original.name}</Text>
      },
      {
        header: "Ngày bắt đầu",
        accessorKey: "startDate",
        cell: ({ getValue }) => {
          const d = getValue() as Date
          const dt = new Date(d)
          return <Text size="sm">{dt.toLocaleDateString("vi-VN")}</Text>
        }
      },
      {
        header: "Ngày kết thúc",
        accessorKey: "endDate",
        cell: ({ getValue }) => {
          const d = getValue() as Date
          const dt = new Date(d)
          return <Text size="sm">{dt.toLocaleDateString("vi-VN")}</Text>
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
          const d = getValue() as Date
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
                <>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => openDetailModal(row.original)}
                  >
                    <IconEye size={18} />
                  </ActionIcon>
                  {row.original.isCurrent ? null : (
                    <Can roles="superadmin">
                      <ActionIcon
                        variant="subtle"
                        color="yellow"
                        onClick={() => openSetCurrentConfirm(row.original)}
                        title="Đặt làm Sprint hiện tại"
                      >
                        <IconStar size={18} />
                      </ActionIcon>
                    </Can>
                  )}
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => openDeleteConfirm(row.original)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </>
              )}
              {deleted && (
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
          <Title order={3}>Quản lý Sprint</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreateModal}
          >
            Tạo Sprint
          </Button>
        </Group>

        <DataTable<ISprint, unknown>
          columns={columns}
          data={filteredSprints}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 50, 100]}
          enableGlobalFilter={false}
          extraFilters={
            <Select
              placeholder="Trạng thái"
              value={deletedFilter}
              onChange={(v) => setDeletedFilter((v as any) ?? "all")}
              data={[
                { value: "all", label: "Tất cả" },
                { value: "active", label: "Hoạt động" },
                { value: "deleted", label: "Đã xóa" }
              ]}
            />
          }
          extraActions={
            <Text c="dimmed" size="sm">
              {isLoading ? "Đang tải..." : `${filteredSprints.length} sprint`}
            </Text>
          }
        />
      </Stack>
    </AppLayout>
  )
}
