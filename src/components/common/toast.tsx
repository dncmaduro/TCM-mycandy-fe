import { notifications } from "@mantine/notifications"

export const TToast = () => {
  return {
    success: ({ title, message }: { title: string; message: string }) => {
      notifications.show({
        message,
        title,
        color: "green"
      })
    },
    info: ({ title, message }: { title: string; message: string }) => {
      notifications.show({
        message,
        title,
        color: "indigo"
      })
    },
    error: ({ title, message }: { title: string; message: string }) => {
      notifications.show({
        message,
        title,
        color: "red"
      })
    },
    warning: ({ title, message }: { title: string; message: string }) => {
      notifications.show({
        message,
        title,
        color: "yellow"
      })
    }
  }
}
