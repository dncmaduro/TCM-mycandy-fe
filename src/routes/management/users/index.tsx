import { createFileRoute } from "@tanstack/react-router"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { AppLayout } from "../../../components/layouts/app-layout"
import { DataTable } from "../../../components/common/data-table"
import { useProfile } from "../../../hooks/use-profile"
import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { IProfile, ProfileStatus } from "../../../types/interfaces"
import {
  Avatar,
  Badge,
  Group,
  Select,
  Text,
  TextInput,
  Button
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import type { AdminSearchProfilesResponse } from "../../../types/models"
import { useDebouncedValue } from "@mantine/hooks"
import { type Role, ROLE_OPTIONS } from "../../../constants/role"

export const Route = createFileRoute("/management/users/")({
  component: RouteComponent
})

function RouteComponent() {
  const { adminSearchProfiles } = useProfile()

  const navigate = Route.useNavigate()

  const [page, setPage] = useState(1)
  const limit = 10
  const [searchText, setSearchText] = useState("")
  const [role, setRole] = useState<Role | undefined>(undefined)
  const [status, setStatus] = useState<ProfileStatus | undefined>(undefined)
  const [debouncedSearch] = useDebouncedValue(searchText, 400)

  const { data, isLoading } = useQuery<AdminSearchProfilesResponse>({
    queryKey: [
      "admin-profiles",
      { page, limit, searchText: debouncedSearch, role, status }
    ],
    queryFn: async () => {
      const resp = await adminSearchProfiles({
        page,
        limit,
        searchText: debouncedSearch,
        role,
        status
      })
      return resp.data
    },
    placeholderData: keepPreviousData
  })

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const columns = useMemo<ColumnDef<IProfile, unknown>[]>(
    () => [
      {
        header: "Người dùng",
        accessorKey: "name",
        cell: ({ row }) => (
          <Group gap="sm">
            <Avatar size={28} radius="xl" src={row.original.avatarUrl} />
            <div>
              <Text fw={600}>{row.original.name || "Chưa có tên"}</Text>
              <Text size="xs" c="dimmed">
                ID: {row.original._id}
              </Text>
            </div>
          </Group>
        )
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = getValue() as ProfileStatus
          const map: Record<ProfileStatus, { color: string; label: string }> = {
            pending: { color: "yellow", label: "Chờ duyệt" },
            active: { color: "green", label: "Hoạt động" },
            rejected: { color: "red", label: "Từ chối" },
            suspended: { color: "gray", label: "Tạm khóa" }
          }
          const m = map[v]
          return (
            <Badge color={m.color} variant="light">
              {m.label}
            </Badge>
          )
        }
      },
      {
        header: "Tạo lúc",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const d = getValue() as Date
          const dt = typeof d === "string" ? new Date(d) : d
          return <Text size="sm">{dt.toLocaleString()}</Text>
        }
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Button
            size="xs"
            variant="subtle"
            onClick={() =>
              navigate({
                to: `/management/users/${encodeURIComponent(row.original._id)}`
              })
            }
          >
            Chi tiết
          </Button>
        )
      }
    ],
    []
  )

  return (
    <AppLayout>
      <DataTable<IProfile, unknown>
        columns={columns}
        data={rows}
        initialPageSize={limit}
        pageSizeOptions={[10, 20, 50, 100]}
        enableGlobalFilter={false}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        extraFilters={
          <Group gap="xs">
            <TextInput
              placeholder="Tìm kiếm..."
              leftSection={<IconSearch size={16} />}
              value={searchText}
              onChange={(e) => {
                setPage(1)
                setSearchText(e.currentTarget.value)
              }}
            />
            <Select
              placeholder="Chọn role"
              data={ROLE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))}
              value={role}
              onChange={(v) => {
                setPage(1)
                setRole((v as Role) ?? undefined)
              }}
              clearable
            />
            <Select
              placeholder="Chọn trạng thái"
              data={[
                { value: "pending", label: "Chờ duyệt" },
                { value: "active", label: "Hoạt động" },
                { value: "rejected", label: "Từ chối" },
                { value: "suspended", label: "Tạm khóa" }
              ]}
              value={status}
              onChange={(v) => {
                setPage(1)
                setStatus((v as ProfileStatus) ?? undefined)
              }}
              clearable
            />
          </Group>
        }
        extraActions={
          <Text c="dimmed" size="sm">
            {isLoading ? "Đang tải..." : `${rows.length} / ${total} kết quả`}
          </Text>
        }
      />
    </AppLayout>
  )
}
