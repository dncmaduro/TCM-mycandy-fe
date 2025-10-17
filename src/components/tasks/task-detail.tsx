import {
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  Divider
} from "@mantine/core"
import { ITask } from "../../types/interfaces"
import { useUsers } from "../../hooks/use-users"
import { useSprints } from "../../hooks/use-sprints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IconPencil } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { TaskModal } from "./task-modal"
import { FormProvider, useForm } from "react-hook-form"
import { UpdateTaskRequest } from "../../types/models"
import { useTasks } from "../../hooks/use-tasks"
import { notifications } from "@mantine/notifications"
import { TaskTagsDisplay } from "./TaskTagsDisplay"

interface TaskDetailProps {
  task: ITask
}

export const TaskDetail = ({ task }: TaskDetailProps) => {
  const { getUser } = useUsers()
  const { getSprint } = useSprints()
  const { updateTask } = useTasks()
  const qc = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: ["user", task.assignedTo],
    queryFn: () => getUser(task.assignedTo || ""),
    enabled: !!task.assignedTo,
    staleTime: Infinity
  })

  const { data: createdByData } = useQuery({
    queryKey: ["user", task.createdBy],
    queryFn: () => getUser(task.createdBy),
    staleTime: Infinity
  })

  const { data: sprintData } = useQuery({
    queryKey: ["sprint", task.sprint],
    queryFn: () => getSprint(task.sprint),
    enabled: !!task.sprint,
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
      tags: task.tags || [],
      sprint: task.sprint || undefined
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
      qc.invalidateQueries({ queryKey: ["kanban-tasks"] })
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
        <Text size="lg" fw={700}>
          {task.title}
        </Text>
      </div>

      <Divider />

      {task.description && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Mô tả
          </Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{task.description}</Text>
        </div>
      )}

      <Group grow>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Trạng thái
          </Text>
          <Badge
            color={statusStyles[task.status]?.color}
            variant="dot"
            size="lg"
          >
            {statusStyles[task.status]?.label}
          </Badge>
        </div>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Ưu tiên
          </Text>
          <Badge
            color={priorityStyles[task.priority]?.color}
            variant="light"
            size="lg"
          >
            {priorityStyles[task.priority]?.label}
          </Badge>
        </div>
      </Group>

      {task.assignedTo && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Người được giao
          </Text>
          <Group gap="sm">
            <Avatar
              src={userData?.data.user?.avatarUrl}
              radius="xl"
              size="sm"
            />
            <div>
              <Text size="md" fw={500}>
                {userData?.data.user?.name || userData?.data.user?.email}
              </Text>
              {userData?.data.user?.name && (
                <Text c="dimmed" size="xs">
                  {userData?.data.user?.email}
                </Text>
              )}
            </div>
          </Group>
        </div>
      )}

      <div>
        <Text size="sm" fw={600} c="dimmed" mb={4}>
          Người tạo
        </Text>
        <Group gap="sm">
          <Avatar
            src={createdByData?.data.user?.avatarUrl}
            radius="xl"
            size="sm"
          />
          <div>
            <Text size="md" fw={500}>
              {createdByData?.data.user?.name ||
                createdByData?.data.user?.email}
            </Text>
            {createdByData?.data.user?.name && (
              <Text c="dimmed" size="xs">
                {createdByData?.data.user?.email}
              </Text>
            )}
          </div>
        </Group>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Thẻ phân loại
          </Text>
          <TaskTagsDisplay tagNames={task.tags} maxVisible={10} />
        </div>
      )}

      {task.sprint && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Chu kì
          </Text>
          <Badge variant="dot" color="violet" size="lg">
            {sprintData?.data.sprint?.name || task.sprint}
          </Badge>
        </div>
      )}

      {task.dueDate && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Hạn hoàn thành
          </Text>
          <Text fw={500}>{new Date(task.dueDate).toLocaleString("vi-VN")}</Text>
        </div>
      )}

      {task.completedAt && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Hoàn thành lúc
          </Text>
          <Text fw={500}>
            {new Date(task.completedAt).toLocaleString("vi-VN")}
          </Text>
        </div>
      )}

      <Divider />

      <Group grow>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Ngày tạo
          </Text>
          <Text size="sm">
            {new Date(task.createdAt).toLocaleString("vi-VN")}
          </Text>
        </div>
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Cập nhật lần cuối
          </Text>
          <Text size="sm">
            {new Date(task.updatedAt).toLocaleString("vi-VN")}
          </Text>
        </div>
      </Group>

      {task.parentTaskId && (
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Task cha
          </Text>
          <Text size="sm" c="dimmed">
            ID: {task.parentTaskId}
          </Text>
        </div>
      )}

      <Divider />

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
