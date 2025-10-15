import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { useEnsureAuth } from "../../hooks/use-ensure-auth"
import { useUsers } from "../../hooks/use-users"
import { useAuthStore } from "../../stores/authState"
import { useQuery } from "@tanstack/react-query"
import { AuthLayout } from "../../components/layouts/AuthLayout"
import {
  Stack,
  ThemeIcon,
  Title,
  Text,
  Button,
  Loader,
  Group
} from "@mantine/core"
import {
  IconClockHour4,
  IconX,
  IconBan,
  IconRefresh,
  IconHome
} from "@tabler/icons-react"

export const Route = createFileRoute("/account/")({
  component: RouteComponent
})

function RouteComponent() {
  useEnsureAuth({ redirectTo: "/" })
  const { getMe } = useUsers()
  const navigate = Route.useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    select: (res) => res.data.user,
    staleTime: 30_000
  })

  const status = data?.status as
    | "pending"
    | "rejected"
    | "suspend"
    | "active"
    | undefined

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/", replace: true })
      return
    }
    if (status === "active") {
      navigate({ to: "/home", replace: true })
    }
  }, [status, isAuthenticated, navigate])

  let icon: React.ReactNode = null
  let title = "Tài khoản"
  let message: React.ReactNode = null
  let color: string = "gray"

  if (isLoading) {
    return (
      <AuthLayout>
        <Stack align="center" gap="md">
          <Loader />
          <Text size="sm" c="dimmed">
            Đang tải thông tin tài khoản...
          </Text>
        </Stack>
      </AuthLayout>
    )
  }

  if (!status) {
    message = (
      <Text size="sm" c="dimmed">
        Không lấy được trạng thái tài khoản. Thử lại sau.
      </Text>
    )
  } else if (status === "pending") {
    icon = <IconClockHour4 size={36} />
    title = "Chờ xác nhận"
    color = "yellow"
    message = (
      <Text ta="center">
        Tài khoản của bạn đang chờ admin phê duyệt. Bạn sẽ được kích hoạt sớm;
        vui lòng quay lại sau hoặc làm mới.
      </Text>
    )
  } else if (status === "rejected") {
    icon = <IconX size={36} />
    title = "Đã bị từ chối"
    color = "red"
    message = (
      <Text ta="center">
        Tài khoản của bạn đã bị admin từ chối. Nếu đây là nhầm lẫn, hãy liên hệ
        hỗ trợ để được xem xét lại.
      </Text>
    )
  } else if (status === "suspend") {
    icon = <IconBan size={36} />
    title = "Tạm khóa"
    color = "orange"
    message = (
      <Text ta="center">
        Tài khoản đang bị tạm khóa do vi phạm chính sách hoặc hoạt động bất
        thường. Kiểm tra email hoặc liên hệ hỗ trợ để biết thêm chi tiết.
      </Text>
    )
  } else if (status === "active") {
    // Render nothing; effect will navigate
    return null
  }

  return (
    <AuthLayout>
      <Stack align="center" gap="xl">
        <ThemeIcon size={72} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <Stack gap={4} align="center">
          <Title order={2}>{title}</Title>
          {message}
        </Stack>
        <Group>
          <Button
            variant="outline"
            leftSection={<IconRefresh size={16} />}
            loading={isRefetching}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <Button
            leftSection={<IconHome size={16} />}
            variant="subtle"
            onClick={() => {
              clearAuth()
              navigate({ to: "/", replace: true })
            }}
          >
            Đăng nhập lại
          </Button>
        </Group>
      </Stack>
    </AuthLayout>
  )
}
