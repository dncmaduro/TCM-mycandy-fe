import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Title,
  Text,
  Stack,
  ThemeIcon,
  Anchor,
  TextInput,
  Button,
  Paper,
  Alert
} from "@mantine/core"
import { IconLock, IconInfoCircle } from "@tabler/icons-react"
import { AuthLayout } from "../../components/layouts/auth-layout"
import { useState } from "react"
import { useForm } from "@mantine/form"
import { TToast } from "../../components/common/toast"
import { useAuth } from "../../hooks/use-auth"
import { useMutation } from "@tanstack/react-query"

export const Route = createFileRoute("/forgot-password/")({
  component: RouteComponent
})

function RouteComponent() {
  const [emailSent, setEmailSent] = useState(false)
  const toast = TToast()
  const { forgotPassword } = useAuth()

  const form = useForm({
    initialValues: {
      email: ""
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Email không hợp lệ"
    }
  })

  const { mutate: handleForgotPassword, isPending: loading } = useMutation({
    mutationFn: (values: { email: string }) => forgotPassword(values),
    onSuccess: () => {
      setEmailSent(true)
      toast.success({
        title: "Email đã được gửi",
        message: "Vui lòng kiểm tra email để đặt lại mật khẩu"
      })
    },
    onError: (error: any) => {
      toast.error({
        title: "Có lỗi xảy ra",
        message:
          error?.response?.data?.message ||
          "Không thể gửi email, vui lòng thử lại"
      })
    }
  })

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
            Quên mật khẩu
          </Title>
          <Text size="md" c="dimmed" ta="center">
            Nhập email để nhận link đặt lại mật khẩu
          </Text>
        </Stack>

        {emailSent ? (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Email đã được gửi"
            color="green"
            w="100%"
          >
            <Stack gap="sm">
              <Text size="sm">
                Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui
                lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </Text>
              <Text size="sm">
                Nếu không thấy email, vui lòng kiểm tra thư mục spam.
              </Text>
              <Button component={Link} to="/" variant="light" mt="md">
                Quay lại đăng nhập
              </Button>
            </Stack>
          </Alert>
        ) : (
          <Paper w="100%" p="md" radius="md" withBorder>
            <form
              onSubmit={form.onSubmit((values) => handleForgotPassword(values))}
            >
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  {...form.getInputProps("email")}
                />
                <Text size="xs" c="dimmed">
                  Nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt
                  lại mật khẩu đến email này.
                </Text>
                <Button
                  type="submit"
                  size="lg"
                  radius="md"
                  fullWidth
                  variant="gradient"
                  gradient={{ from: "blue", to: "purple", deg: 45 }}
                  loading={loading}
                >
                  Gửi link đặt lại mật khẩu
                </Button>
                <Text size="sm" ta="center" c="dimmed">
                  Nhớ mật khẩu?{" "}
                  <Anchor component={Link} to="/">
                    Đăng nhập ngay
                  </Anchor>
                </Text>
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
