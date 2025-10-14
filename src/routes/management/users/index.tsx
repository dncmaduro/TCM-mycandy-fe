import { createFileRoute } from "@tanstack/react-router"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { DataTable } from "../../../components/common/data-table"
import { useUsers } from "../../../hooks/use-users"
import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { IUser } from "../../../types/interfaces"
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
import type { SearchUsersResponse } from "../../../types/models"
import { useDebouncedValue } from "@mantine/hooks"

export const Route = createFileRoute("/management/users/")({
  component: RouteComponent
})

function RouteComponent() {
  const { searchUsers } = useUsers()

  const navigate = Route.useNavigate()

  const [page, setPage] = useState(1)
  const limit = 10
  const [searchText, setSearchText] = useState("")
  const [role, setRole] = useState<string | undefined>(undefined)
  const [debouncedSearch] = useDebouncedValue(searchText, 400)

  const { data, isLoading } = useQuery<SearchUsersResponse>({
    queryKey: ["users", { page, limit, searchText: debouncedSearch, role }],
    queryFn: async () => {
      const resp = await searchUsers({
        page,
        limit,
        searchText: debouncedSearch,
        role
      })
      return resp.data
    },
    placeholderData: keepPreviousData
  })

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const columns = useMemo<ColumnDef<IUser, unknown>[]>(
    () => [
      {
        header: "Người dùng",
        accessorKey: "name",
        cell: ({ row }) => (
          <Group gap="sm">
            <Avatar size={28} radius="xl" src={row.original.avatarUrl} />
            <div>
              <Text fw={600}>{row.original.name ?? row.original.email}</Text>
              <Text size="xs" c="dimmed">
                {row.original.email}
              </Text>
            </div>
          </Group>
        )
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = getValue() as IUser["status"]
          const map: Record<IUser["status"], { color: string; label: string }> =
            {
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
      <DataTable<IUser, unknown>
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
              data={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
                { value: "superadmin", label: "Super Admin" }
              ]}
              value={role}
              onChange={(v) => {
                setPage(1)
                setRole(v ?? undefined)
              }}
              clearable
            />
          </Group>
        }
        extraActions={
          <Text c="dimmed" size="sm">
            {isLoading ? "Đang tải..." : `${rows.length} kết quả`}
          </Text>
        }
      />
    </AppLayout>
  )
}
