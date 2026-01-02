import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppLayout } from "../../../components/layouts/app-layout"
import { useProfile } from "../../../hooks/use-profile"
import { useRoles } from "../../../hooks/use-roles"
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  Paper,
  MultiSelect
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { Can } from "../../../components/common/Can"
import {
  type Role,
  ROLE_OPTIONS,
  getRoleLabel,
  getRoleColor
} from "../../../constants/role"
import { useState } from "react"

export const Route = createFileRoute("/management/users/$userId")({
  component: RouteComponent
})

function RouteComponent() {
  const { getProfile } = useProfile()
  const { getRole, setRole } = useRoles()
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const qc = useQueryClient()
  const userId = params.userId as string

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile({ id: userId }),
    enabled: !!userId
  })

  const { data: roleResp, isLoading: isRoleLoading } = useQuery({
    queryKey: ["user-role", userId],
    queryFn: () => getRole(userId),
    enabled: !!userId
  })

  const profile = data?.data.profile
  const currentRoles = (roleResp?.data.roles as Role[]) ?? []
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(currentRoles)

  const { mutate: saveRoles, isPending: isSaving } = useMutation({
    mutationFn: async (roles: Role[]) =>
      (await setRole(userId, { roles })).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["user-role", userId] })
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật roles người dùng",
        color: "green"
      })
    },
    onError: (error) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật roles",
        color: "red"
      })
    }
  })

  const hasRolesChanged =
    JSON.stringify([...selectedRoles].sort()) !==
    JSON.stringify([...currentRoles].sort())

  console.log(data)

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
        ) : !profile ? (
          <Text c="dimmed">Không tìm thấy người dùng.</Text>
        ) : (
          <Stack gap="lg">
            {/* User Profile Card */}
            <Paper p="lg" radius="md" withBorder>
              <Group align="flex-start" gap="lg">
                <Avatar size={80} radius="md" src={profile.avatarUrl} />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="sm" align="center">
                    <Title order={2}>{profile.name || "Chưa có tên"}</Title>
                    <Badge
                      size="lg"
                      variant="light"
                      color={
                        profile.status === "active"
                          ? "green"
                          : profile.status === "pending"
                            ? "yellow"
                            : "red"
                      }
                    >
                      {profile.status === "active" && "Hoạt động"}
                      {profile.status === "pending" && "Chờ duyệt"}
                      {profile.status === "rejected" && "Từ chối"}
                      {profile.status === "suspended" && "Tạm khóa"}
                    </Badge>
                  </Group>
                  <Text size="lg" c="dimmed">
                    ID: {profile._id}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Tham gia từ{" "}
                    {new Date(profile.createdAt).toLocaleDateString("vi-VN", {
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
                      Roles hiện tại
                    </Text>
                    {isRoleLoading ? (
                      <Text size="sm" c="dimmed">
                        Đang tải...
                      </Text>
                    ) : currentRoles.length === 0 ? (
                      <Badge size="lg" variant="light" color="gray">
                        (Chưa có role)
                      </Badge>
                    ) : (
                      <Group gap="xs">
                        {currentRoles.map((r) => (
                          <Badge
                            key={r}
                            size="lg"
                            variant="filled"
                            color={getRoleColor(r)}
                          >
                            {getRoleLabel(r)}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Stack>

                  <Can roles="superadmin" fallback={null}>
                    <Stack gap="xs" style={{ flex: 1, maxWidth: 400 }}>
                      <Text fw={600} size="sm" c="dimmed">
                        Cập nhật roles
                      </Text>
                      <Group gap="sm" align="flex-start">
                        <MultiSelect
                          placeholder="Chọn roles"
                          data={ROLE_OPTIONS}
                          value={selectedRoles}
                          onChange={(values) =>
                            setSelectedRoles(values as Role[])
                          }
                          style={{ flex: 1 }}
                          clearable
                          searchable={false}
                        />
                        <Button
                          disabled={!selectedRoles.length || !hasRolesChanged}
                          loading={isSaving}
                          onClick={() =>
                            selectedRoles.length && saveRoles(selectedRoles)
                          }
                          variant="filled"
                        >
                          Lưu
                        </Button>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Chọn nhiều roles cho người dùng này
                      </Text>
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
