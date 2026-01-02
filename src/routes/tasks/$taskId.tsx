import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppLayout } from "../../components/layouts/app-layout"
import {
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  Divider,
  Tabs,
  Title,
  Loader,
  Paper,
  Progress
} from "@mantine/core"
import { IconPencil, IconArrowLeft } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { TaskModal } from "../../components/tasks/task-modal"
import { FormProvider, useForm } from "react-hook-form"
import { UpdateTaskRequest } from "../../types/models"
import { useTasks } from "../../hooks/use-tasks"
import { notifications } from "@mantine/notifications"
import { TaskTagsDisplay } from "../../components/tasks/task-tags-display"
import { TaskLogs } from "../../components/tasks/task-logs"

export const Route = createFileRoute("/tasks/$taskId")({
  component: RouteComponent
})

function RouteComponent() {
  const { taskId } = Route.useParams()
  const navigate = useNavigate()
  const { getTask, updateTask } = useTasks()
  const qc = useQueryClient()

  const { data: taskData, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    staleTime: 30000
  })

  const task = taskData?.data.task

  const priorityStyles = {
    low: { color: "gray", label: "Thấp" },
    medium: { color: "blue", label: "Trung bình" },
    high: { color: "orange", label: "Cao" },
    urgent: { color: "red", label: "Khẩn cấp" }
  }

  console.log(task)

  const form = useForm<UpdateTaskRequest>({
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          aim: task.aim,
          aimUnit: task.aimUnit,
          progress: task.progress,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assignedTo:
            typeof task.assignedTo === "string"
              ? task.assignedTo
              : task.assignedTo?._id,
          tags: task.tags || [],
          sprint:
            typeof task.sprint === "string" ? task.sprint : task.sprint._id
        }
      : {}
  })

  const { mutate: handleUpdateTask, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UpdateTaskRequest) => {
      if (!task) return
      return (await updateTask(task._id, data)).data
    },
    onSuccess: () => {
      modals.closeAll()
      qc.invalidateQueries({ queryKey: ["task", taskId] })
      qc.invalidateQueries({ queryKey: ["tasks-weekly"] })
      qc.invalidateQueries({ queryKey: ["task-logs", taskId] })
      notifications.show({
        title: "Thành công",
        message: "Cập nhật task thành công",
        color: "green"
      })
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

  const openEditModal = () => {
    if (!task) return
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
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text c="dimmed">Đang tải thông tin task...</Text>
        </Stack>
      </AppLayout>
    )
  }

  if (!task) {
    return (
      <AppLayout>
        <Stack align="center" py="xl">
          <Text size="lg" fw={600}>
            Không tìm thấy task
          </Text>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: "/tasks/weekly" })}
          >
            Quay lại danh sách
          </Button>
        </Stack>
      </AppLayout>
    )
  }

  const progressPercentage =
    task.aim > 0 ? Math.round((task.progress / task.aim) * 100) : 0

  return (
    <AppLayout>
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate({ to: "/tasks/weekly" })}
            >
              Quay lại
            </Button>
            <Title order={2}>Chi tiết Task</Title>
          </Group>
          <Button
            variant="light"
            leftSection={<IconPencil size={16} />}
            color="yellow.8"
            onClick={openEditModal}
            loading={isUpdating}
          >
            Chỉnh sửa
          </Button>
        </Group>

        <Paper withBorder p="xl" radius="md">
          <Stack gap="lg">
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Tiêu đề
              </Text>
              <Title order={3}>{task.title}</Title>
            </div>

            <Divider />

            {task.description && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={4}>
                  Mô tả
                </Text>
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {task.description}
                </Text>
              </div>
            )}

            <Group grow>
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
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={8}>
                  Tiến độ
                </Text>
                <Text size="xs" c="dimmed" mb={4}>
                  {task.progress}/{task.aim} {task.aimUnit} (
                  {progressPercentage}%)
                </Text>
                <Progress
                  value={progressPercentage}
                  color={
                    progressPercentage >= 100
                      ? "teal"
                      : progressPercentage > 0
                        ? "yellow"
                        : "blue"
                  }
                  size="md"
                  radius="xl"
                />
              </div>
            </Group>

            {task.assignedTo && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={8}>
                  Người được giao
                </Text>
                <Group gap="sm">
                  <Avatar
                    src={task.assignedTo.avatarUrl}
                    radius="xl"
                    size="md"
                  />
                  <div>
                    <Text size="md" fw={500}>
                      {task.assignedTo.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {task.assignedTo.accountId}
                    </Text>
                  </div>
                </Group>
              </div>
            )}

            {task.createdBy && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={8}>
                  Người tạo
                </Text>
                <Group gap="sm">
                  <Avatar
                    src={task.createdBy.avatarUrl}
                    radius="xl"
                    size="md"
                  />
                  <div>
                    <Text size="md" fw={500}>
                      {task.createdBy.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {task.createdBy.accountId}
                    </Text>
                  </div>
                </Group>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={8}>
                  Thẻ phân loại
                </Text>
                <TaskTagsDisplay tagNames={task.tags} maxVisible={10} />
              </div>
            )}

            {task.sprint && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={8}>
                  Sprint
                </Text>
                <Badge variant="dot" color="violet" size="lg">
                  {typeof task.sprint === "string"
                    ? task.sprint
                    : task.sprint.name}
                </Badge>
              </div>
            )}

            {task.dueDate && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb={4}>
                  Hạn hoàn thành
                </Text>
                <Text fw={500}>
                  {new Date(task.dueDate).toLocaleString("vi-VN")}
                </Text>
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
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Tabs defaultValue="logs" keepMounted={false}>
            <Tabs.List>
              <Tabs.Tab value="logs">Lịch sử thay đổi</Tabs.Tab>
              <Tabs.Tab value="comments">Bình luận</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="logs" pt="md">
              <TaskLogs taskId={task._id} />
            </Tabs.Panel>

            <Tabs.Panel value="comments" pt="md">
              <Text c="dimmed" ta="center" py="xl">
                Tính năng bình luận sẽ được triển khai sau
              </Text>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </AppLayout>
  )
}
