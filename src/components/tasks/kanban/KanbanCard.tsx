import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Card,
  Text,
  Group,
  Badge,
  Avatar,
  ActionIcon,
  Stack
} from "@mantine/core"
import { IconEye, IconTrash, IconGripVertical } from "@tabler/icons-react"
import type { ITask } from "../../../types/interfaces"
import { TaskTagsDisplay } from "../TaskTagsDisplay"

interface KanbanCardProps {
  task: ITask
  usersMap: Map<string, { _id: string; name: string; avatarUrl?: string }>
  sprintsMap: Map<string, { _id: string; name: string }>
  onView: (task: ITask) => void
  onDelete: (task: ITask) => void
}

export function KanbanCard({
  task,
  usersMap,
  sprintsMap,
  onView,
  onDelete
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab"
  }

  const priorityMap: Record<
    ITask["priority"],
    { color: string; label: string }
  > = {
    low: { color: "gray", label: "Thấp" },
    medium: { color: "blue", label: "Trung bình" },
    high: { color: "orange", label: "Cao" },
    urgent: { color: "red", label: "Khẩn cấp" }
  }

  const user = task.assignedTo ? usersMap.get(task.assignedTo) : undefined
  const priority = priorityMap[task.priority]

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      className="transition-shadow hover:shadow-md"
    >
      <Stack gap="xs">
        {/* Header with drag handle */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
            <div {...attributes} {...listeners}>
              <IconGripVertical
                size={16}
                style={{ cursor: "grab", flexShrink: 0 }}
              />
            </div>
            <Text fw={600} size="sm" lineClamp={2} style={{ flex: 1 }}>
              {task.title}
            </Text>
          </Group>
          <Badge
            size="xs"
            color={priority.color}
            variant="light"
            style={{ flexShrink: 0 }}
          >
            {priority.label}
          </Badge>
        </Group>

        {/* Description */}
        {task.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {task.description}
          </Text>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <TaskTagsDisplay tagNames={task.tags} maxVisible={2} />
        )}

        {/* Sprint */}
        {task.sprint && (
          <Badge size="sm" variant="dot" color="violet">
            {sprintsMap.get(task.sprint)?.name || "N/A"}
          </Badge>
        )}

        {/* Footer */}
        <Group justify="space-between" align="center">
          {/* Assigned user */}
          {user ? (
            <Group gap={4}>
              <Avatar size={20} src={user.avatarUrl} radius="xl" />
              <Text size="xs" lineClamp={1} style={{ maxWidth: 100 }}>
                {user.name}
              </Text>
            </Group>
          ) : (
            <div />
          )}

          {/* Due date */}
          {task.dueDate && (
            <Text size="xs" c="dimmed">
              {new Date(task.dueDate).toLocaleDateString("vi-VN")}
            </Text>
          )}

          {/* Actions */}
          <Group gap={4} style={{ marginLeft: "auto" }}>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation()
                onView(task)
              }}
            >
              <IconEye size={14} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task)
              }}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  )
}
