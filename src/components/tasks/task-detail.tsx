import { Badge, Button, Group, Stack, Text } from "@mantine/core"
import { ITask } from "../../types/interfaces"
import { useUsers } from "../../hooks/use-users"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IconPencil } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { TaskModal } from "./task-modal"
import { FormProvider, useForm } from "react-hook-form"
import { UpdateTaskRequest } from "../../types/models"
import { useTasks } from "../../hooks/use-tasks"
import { notifications } from "@mantine/notifications"

interface TaskDetailProps {
  task: ITask
}

export const TaskDetail = ({ task }: TaskDetailProps) => {
  const { getUser } = useUsers()
  const { updateTask } = useTasks()
  const qc = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: ["user", task.assignedTo],
    queryFn: () => getUser(task.assignedTo || ""),
    enabled: !!task.assignedTo,
    staleTime: Infinity
  })

  const statusStyles = {
    new: { color: "blue", label: "Mới" },
    in_progress: { color: "yellow", label: "Đang làm" },
    completed: { color: "green", label: "Hoàn thành" },
    archived: { color: "gray", label: "Lưu trữ" },
    canceled: { color: "red", label: "Hủy" },
    reviewing: { color: "orange", label: "Đang review" }
  }

  const priorityStyles = {
    low: { color: "gray", label: "Thấp" },
    medium: { color: "blue", label: "Trung bình" },
    high: { color: "orange", label: "Cao" },
    urgent: { color: "red", label: "Khẩn cấp" }
  }

  const form = useForm<UpdateTaskRequest>({
    defaultValues: {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      assignedTo: task.assignedTo || undefined,
      tags: task.tags || []
    }
  })

  const { mutate: handleUpdateTask } = useMutation({
    mutationFn: async (data: UpdateTaskRequest) =>
      (await updateTask(task._id, data)).data,
    onSuccess: (response) => {
      modals.closeAll()
      modals.open({
        title: <b>Chi tiết Task</b>,
        size: "xl",
        children: <TaskDetail task={response.task} />
      })
      notifications.show({
        title: "Thành công",
        message: "Cập nhật task thành công",
        color: "green"
      })
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
    },
    onError: (error) => {
      console.error(error)
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật task",
        color: "red"
      })
    }
  })

  const handleSubmit = (values: UpdateTaskRequest) => {
    handleUpdateTask(values)
  }

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={600} c="dimmed">
          Tiêu đề
        </Text>
        <Text size="lg">{task.title}</Text>
      </div>
      {task.description && (
        <div>
          <Text size="sm" fw={600} c="dimmed">
            Mô tả
          </Text>
          <Text>{task.description}</Text>
        </div>
      )}
      {task.assignedTo && (
        <div>
          <Text size="sm" fw={600} c="dimmed">
            Người được giao
          </Text>
          <Group gap={4}>
            <Text size="md">
              {userData?.data.user?.name || userData?.data.user?.email}
            </Text>
            <Text c="dimmed" size="sm">
              ({userData?.data.user?.email})
            </Text>
          </Group>
        </div>
      )}
      <Group>
        <div>
          <Text size="sm" fw={600} c="dimmed">
            Trạng thái
          </Text>
          <Badge color={statusStyles[task.status]?.color} variant="dot">
            {statusStyles[task.status]?.label}
          </Badge>
        </div>
        <div>
          <Text size="sm" fw={600} c="dimmed">
            Ưu tiên
          </Text>
          <Badge color={priorityStyles[task.priority]?.color} variant="light">
            {priorityStyles[task.priority]?.label}
          </Badge>
        </div>
      </Group>
      {task.dueDate && (
        <div>
          <Text size="sm" fw={600} c="dimmed">
            Hạn hoàn thành
          </Text>
          <Text>{new Date(task.dueDate).toLocaleString("vi-VN")}</Text>
        </div>
      )}
      <div>
        <Text size="sm" fw={600} c="dimmed">
          Ngày tạo
        </Text>
        <Text>{new Date(task.createdAt).toLocaleString("vi-VN")}</Text>
      </div>
      <Group justify="flex-end">
        <Button
          variant="light"
          leftSection={<IconPencil />}
          color="yellow.8"
          onClick={() => {
            modals.open({
              title: <b>Chỉnh sửa task</b>,
              size: "xl",
              children: (
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <TaskModal task={task} />
                  </form>
                </FormProvider>
              )
            })
          }}
        >
          Chỉnh sửa
        </Button>
      </Group>
    </Stack>
  )
}
