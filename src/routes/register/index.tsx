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
import { IconUserPlus } from "@tabler/icons-react"
import { AuthLayout } from "../../components/layouts/auth-layout"
import { useEffect } from "react"
import { useAuthStore } from "../../stores/authState"
import { useForm } from "@mantine/form"
import { TToast } from "../../components/common/toast"
import { useAuth } from "../../hooks/use-auth"
import { useMutation } from "@tanstack/react-query"

export const Route = createFileRoute("/register/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const toast = TToast()
  const { register } = useAuth()

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    validate: {
      name: (value: string) =>
        value.length >= 2 ? null : "Tên phải có ít nhất 2 ký tự",
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Email không hợp lệ",
      password: (value: string) =>
        value.length >= 6 ? null : "Mật khẩu phải có ít nhất 6 ký tự",
      confirmPassword: (value: string, values: { password: string }) =>
        value === values.password ? null : "Mật khẩu không khớp"
    }
  })

  const { mutate: handleRegister, isPending: loading } = useMutation({
    mutationFn: (values: {
      name: string
      email: string
      password: string
      confirmPassword: string
    }) => register(values),
    onSuccess: (_data, variables) => {
      toast.success({
        title: "Đăng ký thành công",
        message: `Chào mừng ${variables.name || variables.email}!`
      })
      navigate({ to: "/account" })
    },
    onError: (error: any) => {
      toast.error({
        title: "Đăng ký thất bại",
        message:
          error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      })
    }
  })

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
            <IconUserPlus size={32} />
          </ThemeIcon>
          <Title order={2} size="h3" ta="center" c="dark">
            Đăng ký tài khoản
          </Title>
          <Text size="md" c="dimmed" ta="center">
            Tạo tài khoản mới để bắt đầu
          </Text>
        </Stack>

        <Paper w="100%" p="md" radius="md" withBorder>
          <form onSubmit={form.onSubmit((values) => handleRegister(values))}>
            <Stack gap="md">
              <TextInput
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                required
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                required
                {...form.getInputProps("password")}
              />
              <PasswordInput
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                required
                {...form.getInputProps("confirmPassword")}
              />
              <Group justify="center">
                <Text size="sm" c="dimmed">
                  Đã có tài khoản?{" "}
                  <Anchor component={Link} to="/">
                    Đăng nhập ngay
                  </Anchor>
                </Text>
              </Group>
              <Button
                type="submit"
                size="lg"
                radius="md"
                fullWidth
                variant="gradient"
                gradient={{ from: "blue", to: "purple", deg: 45 }}
                loading={loading}
              >
                Đăng ký
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text size="xs" ta="center" c="dimmed" opacity={0.7}>
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <Anchor href="/legal" size="xs">
            Điều khoản dịch vụ và Chính sách bảo mật
          </Anchor>
          .
        </Text>
      </Stack>
    </AuthLayout>
  )
}
