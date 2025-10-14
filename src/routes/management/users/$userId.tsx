import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppLayout } from "../../../components/layouts/AppLayout"
import { useUsers } from "../../../hooks/use-users"
import { useRoles } from "../../../hooks/use-roles"
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Title,
  Paper
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { Can } from "../../../components/common/Can"
import type { Role } from "../../../constants/role"
import { useState, useEffect } from "react"

export const Route = createFileRoute("/management/users/$userId")({
  component: RouteComponent
})

function RouteComponent() {
  const { getUser } = useUsers()
  const { getRole, setRole } = useRoles()
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const qc = useQueryClient()
  const userId = params.userId as string

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId
  })

  const { data: roleResp, isLoading: isRoleLoading } = useQuery({
    queryKey: ["user-role", userId],
    queryFn: () => getRole(userId),
    enabled: !!userId
  })

  const user = data?.data.user
  const currentRole = (roleResp?.data.role as Role | undefined) ?? undefined
  const [role, setRoleState] = useState<Role | undefined>(currentRole)
  useEffect(() => setRoleState(currentRole), [currentRole])

  const { mutate: saveRole, isPending: isSaving } = useMutation({
    mutationFn: async (r: Role) => (await setRole(userId, { role: r })).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["user-role", userId] })
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật role người dùng",
        color: "green"
      })
    },
    onError: (error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật role",
        color: "red"
      })
    }
  })

  return (
    <AppLayout>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Chi tiết người dùng</Title>
          <Button
            variant="subtle"
            onClick={() => navigate({ to: "/management/users" })}
          >
            Quay lại
          </Button>
        </Group>

        {isLoading ? (
          <Text c="dimmed">Đang tải...</Text>
        ) : error ? (
          <Text c="red">Không thể tải người dùng.</Text>
        ) : !user ? (
          <Text c="dimmed">Không tìm thấy người dùng.</Text>
        ) : (
          <Stack gap="lg">
            {/* User Profile Card */}
            <Paper p="lg" radius="md" withBorder>
              <Group align="flex-start" gap="lg">
                <Avatar size={80} radius="md" src={user.avatarUrl} />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="sm" align="center">
                    <Title order={2}>{user.name ?? user.email}</Title>
                    <Badge
                      size="lg"
                      variant="light"
                      color={
                        user.status === "active"
                          ? "green"
                          : user.status === "pending"
                            ? "yellow"
                            : "red"
                      }
                    >
                      {user.status === "active" && "Hoạt động"}
                      {user.status === "pending" && "Chờ duyệt"}
                      {user.status === "rejected" && "Từ chối"}
                      {user.status === "suspended" && "Tạm khóa"}
                    </Badge>
                  </Group>
                  <Text size="lg" c="dimmed">
                    {user.email}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Tham gia từ{" "}
                    {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </Text>
                </Stack>
              </Group>
            </Paper>

            <Divider />

            {/* Role Management Card */}
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Quản lý quyền</Title>

                <Group align="flex-start" gap="xl">
                  <Stack gap="xs">
                    <Text fw={600} size="sm" c="dimmed">
                      Role hiện tại
                    </Text>
                    {isRoleLoading ? (
                      <Text size="sm" c="dimmed">
                        Đang tải...
                      </Text>
                    ) : (
                      <Badge
                        size="lg"
                        variant="filled"
                        color={
                          currentRole === "superadmin"
                            ? "red"
                            : currentRole === "admin"
                              ? "blue"
                              : "gray"
                        }
                      >
                        {currentRole === "superadmin" && "Super Admin"}
                        {currentRole === "admin" && "Admin"}
                        {currentRole === "user" && "User"}
                        {!currentRole && "(Chưa có)"}
                      </Badge>
                    )}
                  </Stack>

                  <Can roles="superadmin" fallback={null}>
                    <Stack gap="xs" style={{ flex: 1, maxWidth: 300 }}>
                      <Text fw={600} size="sm" c="dimmed">
                        Cập nhật role
                      </Text>
                      <Group gap="sm">
                        <Select
                          placeholder="Chọn role mới"
                          data={[
                            { value: "user", label: "User" },
                            { value: "admin", label: "Admin" },
                            { value: "superadmin", label: "Super Admin" }
                          ]}
                          value={role}
                          onChange={(v) =>
                            setRoleState((v as Role) ?? undefined)
                          }
                          style={{ flex: 1 }}
                          clearable
                        />
                        <Button
                          disabled={!role || role === currentRole}
                          loading={isSaving}
                          onClick={() => role && saveRole(role)}
                          variant="filled"
                        >
                          Lưu
                        </Button>
                      </Group>
                    </Stack>
                  </Can>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Stack>
    </AppLayout>
  )
}
