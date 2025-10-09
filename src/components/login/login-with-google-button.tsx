import { Button, Group } from "@mantine/core"
import { IconBrandGoogle } from "@tabler/icons-react"

export const LoginWithGoogleButton = () => {
  const handleLoginWithGoogle = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`,
      response_type: "code",
      access_type: "offline", // để có refresh_token
      prompt: "consent", // ép re-consent nếu thiếu quyền
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar"
      ].join(" ")
    })

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  return (
    <Button
      onClick={handleLoginWithGoogle}
      size="lg"
      radius="md"
      fullWidth
      variant="gradient"
      gradient={{ from: "blue", to: "purple", deg: 45 }}
      leftSection={<IconBrandGoogle size={20} />}
      styles={{
        root: {
          border: "none",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)"
          }
        }
      }}
    >
      <Group gap="sm" justify="center">
        Đăng nhập với Google
      </Group>
    </Button>
  )
}
