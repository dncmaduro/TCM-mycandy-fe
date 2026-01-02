import {
  Stack,
  Group,
  Avatar,
  Text,
  ActionIcon,
  ScrollArea
} from "@mantine/core"
import { useTasks } from "../../hooks/use-tasks"
import { useQuery } from "@tanstack/react-query"
import { IconEye } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import type { ITaskLog } from "../../types/interfaces"
import { useProfile } from "../../hooks/use-profile"

interface TaskLogsProps {
  taskId: string
}

export function TaskLogs({ taskId }: TaskLogsProps) {
  const { searchTaskLogs } = useTasks()
  const { publicSearchProfiles } = useProfile()

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["task-logs", taskId],
    queryFn: () => searchTaskLogs({ taskId, limit: 50, page: 1 }),
    staleTime: 30000,
    gcTime: 0
  })

  const { data: profilesData } = useQuery({
    queryKey: ["public-search-profiles"],
    queryFn: () => publicSearchProfiles({ limit: 999, page: 1 }),
    staleTime: Infinity,
    select: (data) => {
      return data.data.data
        .map((user) => ({ [user._id]: user }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    }
  })

  const logs: ITaskLog[] = logsData?.data?.data || []

  const formatLogMessage = (log: ITaskLog) => {
    const { type, meta } = log

    switch (type) {
      case "status_change":
        return meta?.from && meta?.to
          ? `đã thay đổi trạng thái từ "${meta.from}" thành "${meta.to}"`
          : `đã thay đổi trạng thái`

      case "update_information":
        const changes: string[] = []
        if (meta?.changes?.title) {
          changes.push(
            `tiêu đề từ "${meta.changes.title.from}" thành "${meta.changes.title.to}"`
          )
        }
        if (meta?.changes?.status) {
          changes.push(
            `trạng thái từ "${meta.changes.status.from}" thành "${meta.changes.status.to}"`
          )
        }
        if (meta?.changes?.priority) {
          changes.push(
            `ưu tiên từ "${meta.changes.priority.from}" thành "${meta.changes.priority.to}"`
          )
        }
        if (meta?.changes?.assignedTo) {
          changes.push(
            `người được giao từ "${meta.changes.assignedTo.from || "chưa giao"}" thành "${meta.changes.assignedTo.to || "chưa giao"}"`
          )
        }
        if (meta?.changes?.description) {
          changes.push("mô tả")
        }
        if (meta?.changes?.dueDate) {
          changes.push(
            `hạn hoàn thành từ "${meta.changes.dueDate.from || "chưa có"}" thành "${meta.changes.dueDate.to || "chưa có"}"`
          )
        }
        if (meta?.changes?.tags) {
          changes.push("thẻ phân loại")
        }
        if (meta?.changes?.sprint) {
          changes.push(
            `sprint từ "${meta.changes.sprint.from || "chưa có"}" thành "${meta.changes.sprint.to || "chưa có"}"`
          )
        }
        return changes.length > 0
          ? `đã cập nhật ${changes.join(", ")}`
          : "đã cập nhật task"

      case "assignment":
        return meta?.assignedTo
          ? `đã giao task cho ${meta.assignedTo.name}`
          : "đã giao task"

      case "comment":
        return "đã bình luận"

      case "sprint_change":
        return meta?.newSprint
          ? `đã chuyển task vào sprint "${meta.newSprint.name}"`
          : "đã chuyển task vào sprint khác"

      default:
        return `đã thực hiện hành động: ${type}`
    }
  }

  if (isLoading) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Đang tải lịch sử...
      </Text>
    )
  }

  if (logs.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Chưa có lịch sử thay đổi nào
      </Text>
    )
  }

  return (
    <ScrollArea.Autosize style={{ maxHeight: 300 }}>
      <Stack gap="md">
        {logs.map((log) => {
          const user = profilesData?.[log.userId ? log.userId._id : ""]
          return (
            <Group key={log._id} align="flex-start" wrap="nowrap" gap="sm">
              <Avatar
                src={user?.avatarUrl}
                size="sm"
                radius="xl"
                style={{ marginTop: 2 }}
              />
              <Stack gap={2} style={{ flex: 1 }}>
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={500}>
                    {user?.name || "Unknown User"}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatLogMessage(log)}
                  </Text>
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        modals.open({
                          title: "Chi tiết thay đổi",
                          children: (
                            <pre style={{ fontSize: 12, overflow: "auto" }}>
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          )
                        })
                      }}
                    >
                      <IconEye size={12} />
                    </ActionIcon>
                  )}
                </Group>
                <Text size="xs" c="dimmed">
                  {new Date(log.createdAt).toLocaleString("vi-VN")}
                </Text>
              </Stack>
            </Group>
          )
        })}
      </Stack>
    </ScrollArea.Autosize>
  )
}

export default TaskLogs
