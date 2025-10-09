import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAuthStore } from "../stores/authState"
import { Title, Text, Stack, ThemeIcon, Divider } from "@mantine/core"
import { IconBrandGoogle } from "@tabler/icons-react"
import { LoginWithGoogleButton } from "../components/login/login-with-google-button"
import { AuthLayout } from "../components/layouts/AuthLayout"

export const Route = createFileRoute("/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/account", replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  return (
    <AuthLayout>
      <Stack align="center" gap="xl">
        <Stack align="center" gap="md">
          <ThemeIcon
            size="xl"
            radius="md"
            variant="gradient"
            gradient={{ from: "blue", to: "purple" }}
          >
            <IconBrandGoogle size={32} />
          </ThemeIcon>
          <Title order={2} size="h3" ta="center" c="dark">
            Đăng nhập
          </Title>
          <Text size="md" c="dimmed" ta="center">
            Sử dụng tài khoản Google để truy cập
          </Text>
        </Stack>

        <Divider w="100%" />

        <Stack gap="md" w="100%">
          <Text size="sm" ta="center" c="dimmed">
            Kết nối với Google để đồng bộ calendar và bắt đầu quản lý công việc
            của bạn
          </Text>
          <LoginWithGoogleButton />

          <Text size="xs" ta="center" c="dimmed" opacity={0.7}>
            Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng
          </Text>
        </Stack>
      </Stack>
    </AuthLayout>
  )
}
