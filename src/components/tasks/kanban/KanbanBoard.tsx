import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  rectIntersection,
  type CollisionDetection
} from "@dnd-kit/core"
import { useState } from "react"
import { Group, ScrollArea } from "@mantine/core"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import type { ITask, TaskStatus } from "../../../types/interfaces"
import type { SearchTasksParams } from "../../../types/models"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTasks } from "../../../hooks/use-tasks"
import { notifications } from "@mantine/notifications"

/** Custom collision detection to prioritize columns over cards */
const createColumnFirstCollision =
  (validStatuses: TaskStatus[]): CollisionDetection =>
  (args) => {
    // Get all collisions
    const collisions = rectIntersection(args)
    // Prefer collisions with column droppables (ids are status keys)
    const columnCollisions = collisions.filter((c) =>
      validStatuses.includes(c.id as TaskStatus)
    )
    if (columnCollisions.length > 0) return columnCollisions
    // Fallback to default behavior for item-level sorting
    return closestCorners(args)
  }

interface KanbanBoardProps {
  filters: Omit<SearchTasksParams, "page" | "limit" | "status">
  usersMap: Map<string, { _id: string; name: string; avatarUrl?: string }>
  onViewTask: (task: ITask) => void
  onDeleteTask: (task: ITask) => void
}

const COLUMNS: Array<{
  status: TaskStatus
  title: string
  color: string
}> = [
  { status: "new", title: "Mới", color: "blue" },
  { status: "in_progress", title: "Đang làm", color: "yellow" },
  { status: "reviewing", title: "Đang review", color: "orange" },
  { status: "completed", title: "Hoàn thành", color: "green" },
  { status: "canceled", title: "Hủy", color: "red" },
  { status: "archived", title: "Lưu trữ", color: "gray" }
]

export function KanbanBoard({
  filters,
  usersMap,
  onViewTask,
  onDeleteTask
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<ITask | null>(null)
  const { updateTask } = useTasks()
  const queryClient = useQueryClient()

  const validStatuses = COLUMNS.map((c) => c.status)
  const collisionDetection = createColumnFirstCollision(validStatuses)

  const { mutate: handleUpdateStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTask(taskId, { status }),
    onSuccess: () => {
      // Invalidate all kanban queries to refetch
      queryClient.invalidateQueries({ queryKey: ["kanban-tasks"] })
      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật trạng thái task",
        color: "green"
      })
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể cập nhật trạng thái",
        color: "red"
      })
      // Invalidate to revert optimistic update
      queryClient.invalidateQueries({ queryKey: ["kanban-tasks"] })
    }
  })

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    // Find the task being dragged from cache
    const allQueries = queryClient.getQueriesData({
      queryKey: ["kanban-tasks"]
    })

    for (const [, data] of allQueries) {
      if (data && typeof data === "object" && "pages" in data) {
        const pages = (data as any).pages
        for (const page of pages) {
          const task = page.data.find((t: ITask) => t._id === active.id)
          if (task) {
            setActiveTask(task)
            return
          }
        }
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string

    // Determine the target status
    let newStatus: TaskStatus | undefined

    if (validStatuses.includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus
    } else {
      // over.id is a task id, find which column/status it belongs to
      const allQueries = queryClient.getQueriesData({
        queryKey: ["kanban-tasks"]
      })

      for (const [queryKey, data] of allQueries) {
        if (data && typeof data === "object" && "pages" in data) {
          const pages = (data as any).pages
          for (const page of pages) {
            const foundTask = page.data.find((t: ITask) => t._id === over.id)
            if (foundTask) {
              // Extract status from queryKey: ["kanban-tasks", status, filters]
              if (Array.isArray(queryKey) && queryKey[1]) {
                newStatus = queryKey[1] as TaskStatus
                break
              }
            }
          }
          if (newStatus) break
        }
      }
    }

    if (!newStatus) return

    // Find current task status
    const allQueries = queryClient.getQueriesData({
      queryKey: ["kanban-tasks"]
    })
    let currentTask: ITask | undefined

    for (const [, data] of allQueries) {
      if (data && typeof data === "object" && "pages" in data) {
        const pages = (data as any).pages
        for (const page of pages) {
          const task = page.data.find((t: ITask) => t._id === taskId)
          if (task) {
            currentTask = task
            break
          }
        }
        if (currentTask) break
      }
    }

    if (!currentTask) return

    // Only update if status changed
    if (currentTask.status !== newStatus) {
      handleUpdateStatus({ taskId, status: newStatus })
    }
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea style={{ width: "100%" }}>
        <Group
          align="flex-start"
          gap="md"
          wrap="nowrap"
          style={{ minWidth: "fit-content" }}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              color={column.color}
              filters={filters}
              usersMap={usersMap}
              onViewTask={onViewTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </Group>
      </ScrollArea>

      <DragOverlay>
        {activeTask && (
          <div style={{ width: 300 }}>
            <KanbanCard
              task={activeTask}
              usersMap={usersMap}
              onView={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
