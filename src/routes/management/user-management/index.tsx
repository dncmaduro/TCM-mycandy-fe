import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"
import {
  Title,
  Stack,
  Group,
  Avatar,
  Text,
  Button,
  Select,
  ActionIcon,
  Tooltip,
  Tabs,
  rem
} from "@mantine/core"
import { useUserManagement } from "../../../hooks/use-user-management"
import { useProfile } from "../../../hooks/use-profile"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { DataTable } from "../../../components/common/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { IconPlus, IconTrash, IconTable, IconSchema } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { NetworkGraph } from "../../../components/management/network-graph"

export const Route = createFileRoute("/management/user-management/")({
  component: RouteComponent
})

type ManagementRow = {
  _id: string
  manager: {
    _id: string
    name?: string
    avatarUrl?: string
  }
  employee: {
    _id: string
    name?: string
    avatarUrl?: string
  }
  createdAt: Date
}

function RouteComponent() {
  const { getAllManagements, assignManager, removeManagement } =
    useUserManagement()
  const { publicSearchProfiles } = useProfile()
  const qc = useQueryClient()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [activeTab, setActiveTab] = useState<string | null>("table")

  const { data, isLoading } = useQuery({
    queryKey: ["user-managements", page, pageSize],
    queryFn: async () => {
      const resp = await getAllManagements({ page, limit: pageSize })
      return resp.data
    },
    staleTime: 30000
  })

  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ["public-profiles-all"],
    queryFn: () => publicSearchProfiles({ limit: 300, page: 1 }),
    staleTime: Infinity
  })

  const managements = useMemo(() => {
    return data?.data ?? []
  }, [data])

  const totalPages = useMemo(() => {
    return Math.ceil((data?.total || 0) / pageSize)
  }, [data?.total, pageSize])

  const profilesList = useMemo(() => {
    return profilesData?.data?.data ?? []
  }, [profilesData])

  const { mutate: handleAssign } = useMutation({
    mutationFn: assignManager,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-managements"] })
      notifications.show({
        title: "Thành công",
        message: "Đã gán manager cho nhân viên",
        color: "green"
      })
      modals.closeAll()
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể gán manager",
        color: "red"
      })
    }
  })

  const { mutate: handleRemove } = useMutation({
    mutationFn: (req: { managerId: string; employeeId: string }) =>
      removeManagement(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-managements"] })
      notifications.show({
        title: "Thành công",
        message: "Đã xóa quan hệ quản lý",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể xóa quan hệ quản lý",
        color: "red"
      })
    }
  })

  const openAssignModal = () => {
    let managerId = ""
    let employeeId = ""

    modals.open({
      title: <b>Gán Manager cho Nhân viên</b>,
      size: "md",
      children: (
        <Stack gap="md">
          <Select
            label="Manager"
            placeholder="Chọn manager"
            data={profilesList.map((p: any) => ({
              value: p._id,
              label: p.name || p.accountId
            }))}
            searchable
            onChange={(value) => (managerId = value || "")}
            required
          />
          <Select
            label="Nhân viên"
            placeholder="Chọn nhân viên"
            data={profilesList.map((p: any) => ({
              value: p._id,
              label: p.name || p.accountId
            }))}
            searchable
            onChange={(value) => (employeeId = value || "")}
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={() => modals.closeAll()}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!managerId || !employeeId) {
                  notifications.show({
                    title: "Lỗi",
                    message: "Vui lòng chọn manager và nhân viên",
                    color: "red"
                  })
                  return
                }
                handleAssign({ managerId, employeeId })
              }}
            >
              Gán
            </Button>
          </Group>
        </Stack>
      )
    })
  }

  const openRemoveConfirm = (management: ManagementRow) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa quan hệ quản lý",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa quan hệ quản lý giữa{" "}
          <strong>{management.manager.name || management.manager._id}</strong>{" "}
          và{" "}
          <strong>{management.employee.name || management.employee._id}</strong>
          ?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        handleRemove({
          managerId: management.manager._id,
          employeeId: management.employee._id
        })
    })
  }

  const columns = useMemo<ColumnDef<ManagementRow>[]>(
    () => [
      {
        header: "Manager",
        accessorKey: "manager",
        cell: ({ row }) => {
          const manager = row.original.manager
          return (
            <Group gap="sm">
              <Avatar src={manager?.avatarUrl} radius="xl" size="sm" />
              <div>
                <Text size="sm" fw={500}>
                  {manager?.name || "Unknown"}
                </Text>
                <Text size="xs" c="dimmed">
                  ID: {manager?._id}
                </Text>
              </div>
            </Group>
          )
        }
      },
      {
        header: "Nhân viên",
        accessorKey: "employee",
        cell: ({ row }) => {
          const employee = row.original.employee
          return (
            <Group gap="sm">
              <Avatar src={employee?.avatarUrl} radius="xl" size="sm" />
              <div>
                <Text size="sm" fw={500}>
                  {employee?.name || "Unknown"}
                </Text>
                <Text size="xs" c="dimmed">
                  ID: {employee?._id}
                </Text>
              </div>
            </Group>
          )
        }
      },
      {
        header: "Ngày gán",
        accessorKey: "createdAt",
        cell: ({ row }) => {
          return (
            <Text size="sm">
              {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          )
        }
      },
      {
        header: "Thao tác",
        id: "actions",
        cell: ({ row }) => (
          <Can roles={["superadmin", "admin"]}>
            <Tooltip label="Xóa quan hệ">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => openRemoveConfirm(row.original)}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          </Can>
        )
      }
    ],
    []
  )

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={3}>Quản lý Manager - Nhân viên</Title>
            <Text c="dimmed" size="sm">
              Thiết lập quan hệ quản lý giữa manager và nhân viên
            </Text>
          </div>
          <Can roles={["superadmin", "admin"]}>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={openAssignModal}
              loading={profilesLoading}
            >
              Gán Manager
            </Button>
          </Can>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab
              value="table"
              leftSection={
                <IconTable style={{ width: rem(16), height: rem(16) }} />
              }
            >
              Dạng bảng
            </Tabs.Tab>
            <Tabs.Tab
              value="tree"
              leftSection={
                <IconSchema style={{ width: rem(16), height: rem(16) }} />
              }
            >
              Cây phân cấp
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="table" pt="md">
            <DataTable<ManagementRow, unknown>
              columns={columns}
              data={managements}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setPage(1)
              }}
              initialPageSize={pageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              enableGlobalFilter={false}
              extraActions={
                <Text c="dimmed" size="sm">
                  {isLoading ? "Đang tải..." : `${data?.total || 0} quan hệ`}
                </Text>
              }
            />
          </Tabs.Panel>

          <Tabs.Panel value="tree" pt="md">
            {isLoading ? (
              <Text c="dimmed" ta="center" py="xl">
                Đang tải...
              </Text>
            ) : (
              <NetworkGraph managements={managements} profiles={profilesList} />
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </AppLayout>
  )
}
