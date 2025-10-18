import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"
import { useTimeRequests } from "../../../hooks/use-time-requests"
import { useUsers } from "../../../hooks/use-users"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type {
  ITimeRequest,
  TimeRequestStatus,
  TimeRequestType
} from "../../../types/interfaces"
import { DataTable } from "../../../components/common/data-table"
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Select,
  Avatar,
  Divider,
  Center
} from "@mantine/core"
import { IconEye, IconCheck, IconX } from "@tabler/icons-react"
import { DateInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"

export const Route = createFileRoute("/time-tracking/manage-requests/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <Can
      roles={["superadmin", "admin"]}
      fallback={
        <AppLayout>
          <Center h={200}>
            <Text c="dimmed">Bạn không có quyền truy cập trang này</Text>
          </Center>
        </AppLayout>
      }
    >
      <ManageRequestsContent />
    </Can>
  )
}

function ManageRequestsContent() {
  const qc = useQueryClient()
  const { getAllTimeRequests, approveTimeRequest, rejectTimeRequest } =
    useTimeRequests()
  const { publicSearchUsers } = useUsers()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState<TimeRequestStatus | "">("")
  const [date, setDate] = useState<Date | null>(null)

  const { data: usersData } = useQuery({
    queryKey: ["public-users"],
    queryFn: () => publicSearchUsers({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const usersMap = useMemo(() => {
    const list = usersData?.data?.data ?? []
    return new Map<string, any>(list.map((u: any) => [u._id, u]))
  }, [usersData])

  const { data, isLoading } = useQuery({
    queryKey: ["all-time-requests", page, pageSize, status, date],
    queryFn: async () => {
      const resp = await getAllTimeRequests({
        page,
        limit: pageSize,
        status: status || undefined,
        date: date || undefined
      })
      return resp.data
    }
  })

  const { mutate: handleApprove, isPending: isApproving } = useMutation({
    mutationFn: approveTimeRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-time-requests"] })
      notifications.show({
        title: "Thành công",
        message: "Đã duyệt yêu cầu",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể duyệt yêu cầu",
        color: "red"
      })
    }
  })

  const { mutate: handleReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectTimeRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-time-requests"] })
      notifications.show({
        title: "Thành công",
        message: "Đã từ chối yêu cầu",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể từ chối yêu cầu",
        color: "red"
      })
    }
  })

  const openDetailModal = (request: ITimeRequest) => {
    modals.open({
      title: <b>Chi tiết yêu cầu</b>,
      size: "xl",
      children: (
        <ManageRequestDetail
          request={request}
          user={usersMap.get(request.createdBy)}
          onApprove={() => handleApprove(request._id)}
          onReject={() => handleReject(request._id)}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      )
    })
  }

  const columns = useMemo<ColumnDef<ITimeRequest>[]>(
    () => [
      {
        header: "Người tạo",
        accessorKey: "createdBy",
        cell: ({ getValue }) => {
          const userId = getValue() as string
          const user = usersMap.get(userId)
          return user ? (
            <Group gap="sm">
              <Avatar src={user.avatarUrl} size="sm" radius="xl" />
              <div>
                <Text size="sm" fw={500}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              </div>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              Unknown
            </Text>
          )
        }
      },
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
          </Group>
        )
      }
    ],
    [usersMap]
  )

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Đã duyệt" },
    { value: "rejected", label: "Từ chối" }
  ]

  return (
    <AppLayout>
      <Stack gap="md">
        <Title order={3}>Quản lý yêu cầu thời gian</Title>

        <DataTable<ITimeRequest, unknown>
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
            setPage(1)
          }}
          extraFilters={
            <Group gap="sm">
              <Select
                placeholder="Trạng thái"
                value={status}
                onChange={(v) => setStatus((v as TimeRequestStatus) || "")}
                data={statusOptions}
                style={{ minWidth: 150 }}
              />
              <DateInput
                placeholder="Chọn ngày"
                value={date}
                onChange={setDate}
                clearable
                valueFormat="DD/MM/YYYY"
                style={{ minWidth: 150 }}
              />
            </Group>
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

interface ManageRequestDetailProps {
  request: ITimeRequest
  user: any
  onApprove: () => void
  onReject: () => void
  isApproving: boolean
  isRejecting: boolean
}

function ManageRequestDetail({
  request,
  user,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: ManageRequestDetailProps) {
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
      <div>
        <Text size="sm" fw={600} c="dimmed" mb={4}>
          Người tạo
        </Text>
        {user ? (
          <Group gap="sm">
            <Avatar src={user.avatarUrl} radius="xl" size="sm" />
            <div>
              <Text size="md" fw={500}>
                {user.name}
              </Text>
              <Text c="dimmed" size="xs">
                {user.email}
              </Text>
            </div>
          </Group>
        ) : (
          <Text c="dimmed">Unknown User</Text>
        )}
      </div>

      <Divider />

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

      {request.reviewedBy && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Đã duyệt bởi
          </Text>
          <Text size="sm">{request.reviewedBy}</Text>
          <Text size="xs" c="dimmed">
            {request.reviewedAt &&
              new Date(request.reviewedAt).toLocaleString("vi-VN")}
          </Text>
        </div>
      )}

      {request.status === "pending" && (
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            color="red"
            leftSection={<IconX />}
            onClick={onReject}
            loading={isRejecting}
          >
            Từ chối
          </Button>
          <Button
            leftSection={<IconCheck />}
            onClick={onApprove}
            loading={isApproving}
          >
            Duyệt
          </Button>
        </Group>
      )}
    </Stack>
  )
}
