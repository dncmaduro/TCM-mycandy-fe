import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"
import { useTimeRequests } from "../../../hooks/use-time-requests"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { ITimeRequest, TimeRequestType } from "../../../types/interfaces"
import { UpdateTimeRequestRequest } from "../../../types/models"
import { DataTable } from "../../../components/common/data-table"
import { TimeRequestForm } from "../../../components/time-requests/request-form"
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Select,
  Divider
} from "@mantine/core"
import { IconPlus, IconEye, IconTrash, IconPencil } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"

export const Route = createFileRoute("/time-tracking/requests/")({
  component: RouteComponent
})

function RouteComponent() {
  const qc = useQueryClient()
  const {
    getOwnTimeRequests,
    createTimeRequest,
    updateTimeRequest,
    deleteTimeRequest
  } = useTimeRequests()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deletedFilter, setDeletedFilter] = useState<boolean>(false)

  const { data, isLoading } = useQuery({
    queryKey: ["own-time-requests", page, pageSize, deletedFilter],
    queryFn: async () => {
      const resp = await getOwnTimeRequests({
        page,
        limit: pageSize,
        deleted: deletedFilter
      })
      return resp.data
    }
  })

  const { mutate: handleCreate, isPending: isCreating } = useMutation({
    mutationFn: createTimeRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-time-requests"] })
      notifications.show({
        title: "Thành công",
        message: "Đã tạo yêu cầu",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tạo yêu cầu",
        color: "red"
      })
    }
  })

  const { mutate: handleUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: UpdateTimeRequestRequest
    }) => updateTimeRequest(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-time-requests"] })
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật yêu cầu",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật yêu cầu",
        color: "red"
      })
    }
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteTimeRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-time-requests"] })
      notifications.show({
        title: "Thành công",
        message: "Đã xóa yêu cầu",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể xóa yêu cầu",
        color: "red"
      })
    }
  })

  const openDetailModal = (request: ITimeRequest) => {
    modals.open({
      title: <b>Chi tiết yêu cầu</b>,
      size: "xl",
      children: (
        <TimeRequestDetail
          request={request}
          onEdit={() => openEditModal(request)}
        />
      )
    })
  }

  const openCreateModal = () => {
    modals.open({
      title: <b>Tạo yêu cầu mới</b>,
      size: "xl",
      children: (
        <TimeRequestForm onSubmit={handleCreate} isLoading={isCreating} />
      )
    })
  }

  const openEditModal = (request: ITimeRequest) => {
    modals.closeAll()
    modals.open({
      title: <b>Chỉnh sửa yêu cầu</b>,
      size: "xl",
      children: (
        <TimeRequestForm
          request={request}
          onSubmit={(data) => handleUpdate({ id: request._id, data })}
          isLoading={isUpdating}
        />
      )
    })
  }

  const openDeleteConfirm = (request: ITimeRequest) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa yêu cầu",
      children: (
        <Text size="sm">Bạn có chắc chắn muốn xóa yêu cầu này không?</Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => handleDelete(request._id)
    })
  }

  const columns = useMemo<ColumnDef<ITimeRequest>[]>(
    () => [
      {
        header: "Loại",
        accessorKey: "type",
        cell: ({ getValue }) => {
          const type = getValue() as TimeRequestType
          const typeMap = {
            overtime: { label: "Tăng ca", color: "blue" },
            day_off: { label: "Nghỉ phép", color: "green" },
            remote_work: { label: "Làm từ xa", color: "cyan" },
            leave_early: { label: "Về sớm", color: "orange" },
            late_arrival: { label: "Đến muộn", color: "red" }
          }
          const config = typeMap[type]
          return (
            <Badge color={config.color} variant="light">
              {config.label}
            </Badge>
          )
        }
      },
      {
        header: "Lý do",
        accessorKey: "reason",
        cell: ({ getValue }) => {
          const reason = getValue() as string
          return (
            <Text size="sm" lineClamp={2}>
              {reason}
            </Text>
          )
        }
      },
      {
        header: "Thời gian",
        accessorKey: "minutes",
        cell: ({ row }) => {
          const minutes = row.original.minutes
          if (row.original.type === "day_off") {
            return <Text size="sm">-</Text>
          }
          return <Text size="sm">{minutes} phút</Text>
        }
      },
      {
        header: "Ngày",
        accessorKey: "date",
        cell: ({ getValue }) => {
          const date = getValue() as Date
          return (
            <Text size="sm">{new Date(date).toLocaleDateString("vi-VN")}</Text>
          )
        }
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue() as string
          const statusMap = {
            pending: { label: "Chờ duyệt", color: "yellow" },
            approved: { label: "Đã duyệt", color: "green" },
            rejected: { label: "Từ chối", color: "red" }
          }
          const config = statusMap[status as keyof typeof statusMap]
          return (
            <Badge color={config.color} variant="light">
              {config.label}
            </Badge>
          )
        }
      },
      {
        header: "Ngày tạo",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const date = getValue() as Date
          return (
            <Text size="sm">{new Date(date).toLocaleDateString("vi-VN")}</Text>
          )
        }
      },
      {
        id: "actions",
        header: "Thao tác",
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
    []
  )

  const rows = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Yêu cầu thời gian làm việc</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreateModal}
          >
            Tạo yêu cầu
          </Button>
        </Group>

        <DataTable<ITimeRequest, unknown>
          columns={columns}
          data={rows}
          initialPageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          enableGlobalFilter={false}
          page={page}
          totalPages={Math.ceil(total / pageSize)}
          onPageChange={setPage}
          onPageSizeChange={(newPageSize: number) => {
            setPageSize(newPageSize)
            setPage(1)
          }}
          extraFilters={
            <Select
              placeholder="Trạng thái"
              value={deletedFilter.toString()}
              onChange={(v) => setDeletedFilter(v === "true")}
              data={[
                { value: "false", label: "Hoạt động" },
                { value: "true", label: "Đã xóa" }
              ]}
            />
          }
          extraActions={
            <Text c="dimmed" size="sm">
              {isLoading ? "Đang tải..." : `${rows.length} yêu cầu`}
            </Text>
          }
        />
      </Stack>
    </AppLayout>
  )
}

interface TimeRequestDetailProps {
  request: ITimeRequest
  onEdit: () => void
}

function TimeRequestDetail({ request, onEdit }: TimeRequestDetailProps) {
  const typeMap = {
    overtime: { label: "Tăng ca", color: "blue" },
    day_off: { label: "Nghỉ phép", color: "green" },
    remote_work: { label: "Làm từ xa", color: "cyan" },
    leave_early: { label: "Về sớm", color: "orange" },
    late_arrival: { label: "Đến muộn", color: "red" }
  }

  const statusMap = {
    pending: { label: "Chờ duyệt", color: "yellow" },
    approved: { label: "Đã duyệt", color: "green" },
    rejected: { label: "Từ chối", color: "red" }
  }

  return (
    <Stack gap="md">
      <Group grow>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Loại yêu cầu
          </Text>
          <Badge color={typeMap[request.type].color} variant="light" size="lg">
            {typeMap[request.type].label}
          </Badge>
        </div>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Trạng thái
          </Text>
          <Badge
            color={statusMap[request.status].color}
            variant="light"
            size="lg"
          >
            {statusMap[request.status].label}
          </Badge>
        </div>
      </Group>

      <Divider />

      <div>
        <Text size="sm" fw={600} c="dimmed" mb={4}>
          Lý do
        </Text>
        <Text>{request.reason}</Text>
      </div>

      {request.type !== "day_off" && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Thời gian
          </Text>
          <Text>{request.minutes} phút</Text>
        </div>
      )}

      <div>
        <Text size="sm" fw={600} c="dimmed" mb={4}>
          Ngày
        </Text>
        <Text>{new Date(request.date!).toLocaleDateString("vi-VN")}</Text>
      </div>

      <Divider />

      {request.reviewers && request.reviewers.length > 0 && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={8}>
            Người duyệt ({request.reviewers.length})
          </Text>
          <Stack gap="xs">
            {request.reviewers.map((reviewer, idx) => {
              const statusConfig = {
                pending: { label: "Chờ duyệt", color: "yellow" },
                approved: { label: "Đã duyệt", color: "green" },
                rejected: { label: "Từ chối", color: "red" }
              }
              const config = statusConfig[reviewer.status]

              return (
                <Group
                  key={idx}
                  justify="space-between"
                  p="xs"
                  style={{
                    border: "1px solid #e9ecef",
                    borderRadius: 8
                  }}
                >
                  <Group gap="xs">
                    <Avatar
                      src={reviewer.profileId.avatarUrl}
                      radius="xl"
                      size="sm"
                    >
                      {idx + 1}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {reviewer.profileId.name || `Reviewer ${idx + 1}`}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {reviewer.profileId._id}
                      </Text>
                    </div>
                  </Group>
                  <div style={{ textAlign: "right" }}>
                    <Badge color={config.color} variant="light" size="sm">
                      {config.label}
                    </Badge>
                    {reviewer.reviewedAt && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {new Date(reviewer.reviewedAt).toLocaleString("vi-VN")}
                      </Text>
                    )}
                  </div>
                </Group>
              )
            })}
          </Stack>
        </div>
      )}

      <Divider />

      <Group grow>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Ngày tạo
          </Text>
          <Text size="sm">
            {new Date(request.createdAt).toLocaleString("vi-VN")}
          </Text>
        </div>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Cập nhật cuối
          </Text>
          <Text size="sm">
            {new Date(request.updatedAt).toLocaleString("vi-VN")}
          </Text>
        </div>
      </Group>

      {request.status === "pending" && (
        <Group justify="flex-end" mt="md">
          <Button variant="light" leftSection={<IconPencil />} onClick={onEdit}>
            Chỉnh sửa
          </Button>
        </Group>
      )}
    </Stack>
  )
}
