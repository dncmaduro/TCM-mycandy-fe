import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import {
  Title,
  Text,
  Stack,
  ThemeIcon,
  Anchor,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Paper
} from "@mantine/core"
import { IconLogin } from "@tabler/icons-react"
import { AuthLayout } from "../components/layouts/auth-layout"
import { useEffect } from "react"
import { useAuthStore } from "../stores/authState"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "../hooks/use-auth"

export const Route = createFileRoute("/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const setAuth = useAuthStore((s) => s.setAuth)
  const { login } = useAuth()

  const form = useForm({
    initialValues: {
      email: "",
      password: ""
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Email không hợp lệ",
      password: (value: string) =>
        value.length >= 6 ? null : "Mật khẩu phải có ít nhất 6 ký tự"
    }
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const { accessToken, refreshToken, tokenExp, rtExp, profile } =
        response.data

      setAuth({
        accessToken,
        refreshToken,
        expiresIn: tokenExp,
        refreshExpiresIn: rtExp,
        user: {
          id: profile.id,
          email: form.values.email,
          name: profile.name,
          avatar: undefined
        }
      })

      notifications.show({
        title: "Đăng nhập thành công",
        message: `Chào mừng ${profile?.name || "bạn"}!`,
        color: "green"
      })

      navigate({ to: "/account" })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Đăng nhập thất bại",
        message:
          error.response?.data?.message ||
          "Email hoặc mật khẩu không chính xác",
        color: "red"
      })
    }
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/account", replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = (values: { email: string; password: string }) => {
    loginMutation.mutate(values)
  }

  if (isAuthenticated) return null

  return (
    <AuthLayout>
      <Stack align="center" gap="xl" className="w">
        <Stack align="center" gap="md">
          <ThemeIcon
            size="xl"
            radius="md"
            variant="gradient"
            gradient={{ from: "blue", to: "purple" }}
          >
            <IconLogin size={32} />
          </ThemeIcon>
          <Title order={2} size="h3" ta="center" c="dark">
            Đăng nhập
          </Title>
          <Text size="md" c="dimmed" ta="center">
            Đăng nhập để quản lý công việc của bạn
          </Text>
        </Stack>

        <Paper w="100%" p="md" radius="md" withBorder>
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                required
                {...form.getInputProps("password")}
              />
              <Group justify="space-between">
                <Anchor component={Link} to="/register" size="sm">
                  Chưa có tài khoản?
                </Anchor>
                <Anchor component={Link} to="/forgot-password" size="sm">
                  Quên mật khẩu?
                </Anchor>
              </Group>
              <Button
                type="submit"
                size="lg"
                radius="md"
                fullWidth
                variant="gradient"
                gradient={{ from: "blue", to: "purple", deg: 45 }}
                loading={loginMutation.isPending}
              >
                Đăng nhập
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text size="xs" ta="center" c="dimmed" opacity={0.7}>
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Anchor href="/legal" size="xs">
            Điều khoản dịch vụ và Chính sách bảo mật
          </Anchor>
          .
        </Text>
      </Stack>
    </AuthLayout>
  )
}
