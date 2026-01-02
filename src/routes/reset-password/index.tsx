import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import {
  Title,
  Text,
  Stack,
  ThemeIcon,
  PasswordInput,
  Button,
  Paper,
  Alert,
  Anchor
} from "@mantine/core"
import { IconLock, IconCheck } from "@tabler/icons-react"
import { AuthLayout } from "../../components/layouts/auth-layout"
import { useState } from "react"
import { useForm } from "@mantine/form"
import { TToast } from "../../components/common/toast"
import { useAuth } from "../../hooks/use-auth"
import { useMutation } from "@tanstack/react-query"

export const Route = createFileRoute("/reset-password/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || ""
    }
  }
})

function RouteComponent() {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const toast = TToast()
  const { resetPassword } = useAuth()

  // Get token from URL query params
  const { token } = Route.useSearch()

  const form = useForm({
    initialValues: {
      newPassword: "",
      confirmPassword: ""
    },
    validate: {
      newPassword: (value: string) =>
        value.length >= 6 ? null : "Mật khẩu phải có ít nhất 6 ký tự",
      confirmPassword: (value: string, values: { newPassword: string }) =>
        value === values.newPassword ? null : "Mật khẩu không khớp"
    }
  })

  const { mutate: handleResetPassword, isPending: loading } = useMutation({
    mutationFn: (values: { newPassword: string }) => {
      if (!token) {
        throw new Error("Token không hợp lệ")
      }
      return resetPassword({ token, newPassword: values.newPassword })
    },
    onSuccess: () => {
      setSuccess(true)
      toast.success({
        title: "Đặt lại mật khẩu thành công",
        message: "Bạn có thể đăng nhập với mật khẩu mới"
      })
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate({ to: "/" })
      }, 3000)
    },
    onError: (error: any) => {
      toast.error({
        title: "Có lỗi xảy ra",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể đặt lại mật khẩu, vui lòng thử lại"
      })
    }
  })

  if (!token) {
    return (
      <AuthLayout>
        <Stack align="center" gap="xl">
          <Alert color="red" title="Token không hợp lệ" w="100%">
            <Stack gap="sm">
              <Text size="sm">
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </Text>
              <Button component={Link} to="/" variant="light" mt="md">
                Quay lại đăng nhập
              </Button>
            </Stack>
          </Alert>
        </Stack>
      </AuthLayout>
    )
  }

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
            <IconLock size={32} />
          </ThemeIcon>
          <Title order={2} size="h3" ta="center" c="dark">
            Đặt lại mật khẩu
          </Title>
          <Text size="md" c="dimmed" ta="center">
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>
        </Stack>

        {success ? (
          <Alert
            icon={<IconCheck size={16} />}
            title="Thành công"
            color="green"
            w="100%"
          >
            <Text size="sm">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển
              đến trang đăng nhập sau giây lát...
            </Text>
          </Alert>
        ) : (
          <Paper w="100%" p="md" radius="md" withBorder>
            <form
              onSubmit={form.onSubmit((values) => handleResetPassword(values))}
            >
              <Stack gap="md">
                <PasswordInput
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  required
                  {...form.getInputProps("newPassword")}
                />
                <PasswordInput
                  label="Xác nhận mật khẩu"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  {...form.getInputProps("confirmPassword")}
                />
                <Button
                  type="submit"
                  size="lg"
                  radius="md"
                  fullWidth
                  variant="gradient"
                  gradient={{ from: "blue", to: "purple", deg: 45 }}
                  loading={loading}
                >
                  Đặt lại mật khẩu
                </Button>
              </Stack>
            </form>
          </Paper>
        )}

        <Text size="xs" ta="center" c="dimmed" opacity={0.7}>
          Bằng cách sử dụng dịch vụ, bạn đồng ý với{" "}
          <Anchor href="/legal" size="xs">
            Điều khoản dịch vụ và Chính sách bảo mật
          </Anchor>
          .
        </Text>
      </Stack>
    </AuthLayout>
  )
}
