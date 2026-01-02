import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"
import { useTimeRequests } from "../../../hooks/use-time-requests"
import { useProfile } from "../../../hooks/use-profile"
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
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Title
} from "@mantine/core"
import { IconEye, IconCheck, IconX } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { TIME_REQUEST_STATUS_OPTIONS } from "../../../constants/time-request"

export const Route = createFileRoute("/time-tracking/pending-review/")({
  component: RouteComponent
})

function RouteComponent() {
  const qc = useQueryClient()
  const { getPendingTimeRequests, approveTimeRequest, rejectTimeRequest } =
    useTimeRequests()
  const { publicSearchProfiles } = useProfile()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<
    TimeRequestStatus | undefined
  >("pending")

  const { data: profilesData } = useQuery({
    queryKey: ["public-profiles"],
    queryFn: () => publicSearchProfiles({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const profilesMap = useMemo(() => {
    const list = profilesData?.data.data ?? []
    return new Map<string, any>(list.map((p: any) => [p._id, p]))
  }, [profilesData])

  const { data, isLoading } = useQuery({
    queryKey: ["pending-review-time-requests", page, pageSize, statusFilter],
    queryFn: async () => {
      const resp = await getPendingTimeRequests({
        page,
        limit: pageSize,
        status: statusFilter
      })
      return resp.data
    }
  })

  const { mutate: handleApprove, isPending: isApproving } = useMutation({
    mutationFn: approveTimeRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-review-time-requests"] })
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
      qc.invalidateQueries({ queryKey: ["pending-review-time-requests"] })
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
      title: <b>Chi tiết yêu cầu chờ duyệt</b>,
      size: "xl",
      children: (
        <PendingReviewDetail
          request={request}
          user={profilesMap.get(request.createdBy._id)}
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
        cell: ({ row }) => {
          const user = profilesMap.get(row.original.createdBy._id)
          return user ? (
            <Group gap="sm">
              <Avatar src={user.avatarUrl} radius="xl" size="sm" />
              <div>
                <Text size="sm" fw={500}>
                  {user.name || row.original.createdBy.name}
                </Text>
              </div>
            </Group>
          ) : (
            <Text size="sm" fw={500}>
              {row.original.createdBy.name}
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
        cell: ({ row }) => {
          return (
            <Badge
              color={
                row.original.status === "approved"
                  ? "green"
                  : row.original.status === "rejected"
                    ? "red"
                    : "yellow"
              }
              variant="light"
            >
              {
                TIME_REQUEST_STATUS_OPTIONS.find(
                  (o) => o.value === row.original.status
                )?.label
              }
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
              color="green"
              onClick={() => {
                modals.openConfirmModal({
                  title: "Xác nhận duyệt",
                  children: (
                    <Text size="sm">
                      Bạn có chắc chắn muốn duyệt yêu cầu này không?
                    </Text>
                  ),
                  labels: { confirm: "Duyệt", cancel: "Hủy" },
                  confirmProps: { color: "green" },
                  onConfirm: () => handleApprove(row.original._id)
                })
              }}
            >
              <IconCheck size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => {
                modals.openConfirmModal({
                  title: "Xác nhận từ chối",
                  children: (
                    <Text size="sm">
                      Bạn có chắc chắn muốn từ chối yêu cầu này không?
                    </Text>
                  ),
                  labels: { confirm: "Từ chối", cancel: "Hủy" },
                  confirmProps: { color: "red" },
                  onConfirm: () => handleReject(row.original._id)
                })
              }}
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        )
      }
    ],
    [profilesMap, handleApprove, handleReject]
  )

  const rows = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Yêu cầu chờ duyệt của tôi</Title>
          <Badge size="lg" color="yellow" variant="light">
            {total} yêu cầu chờ duyệt
          </Badge>
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
            <>
              <Select
                data={TIME_REQUEST_STATUS_OPTIONS}
                value={statusFilter}
                placeholder="Trạng thái"
                onChange={(value) =>
                  setStatusFilter(
                    !!value ? (value as TimeRequestStatus) : undefined
                  )
                }
                clearable
              />
            </>
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

interface PendingReviewDetailProps {
  request: ITimeRequest
  user: any
  onApprove: () => void
  onReject: () => void
  isApproving: boolean
  isRejecting: boolean
}

function PendingReviewDetail({
  request,
  user,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: PendingReviewDetailProps) {
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
            </div>
          </Group>
        ) : (
          <Text size="md" fw={500}>
            {request.createdBy.name}
          </Text>
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
    </Stack>
  )
}
