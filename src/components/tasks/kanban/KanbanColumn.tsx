import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import {
  Paper,
  Text,
  Badge,
  Stack,
  Loader,
  Center,
  Box,
  Group
} from "@mantine/core"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useIntersection } from "@mantine/hooks"
import { useEffect, useRef } from "react"
import { KanbanCard } from "./KanbanCard"
import type { ITask, TaskStatus } from "../../../types/interfaces"
import type { SearchTasksParams } from "../../../types/models"
import { useTasks } from "../../../hooks/use-tasks"

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  color: string
  filters: Omit<SearchTasksParams, "page" | "limit" | "status">
  usersMap: Map<string, { _id: string; name: string; avatarUrl?: string }>
  onViewTask: (task: ITask) => void
  onDeleteTask: (task: ITask) => void
}

export function KanbanColumn({
  status,
  title,
  color,
  filters,
  usersMap,
  onViewTask,
  onDeleteTask
}: KanbanColumnProps) {
  const { searchTasks } = useTasks()
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { ref: intersectionRef, entry } = useIntersection({
    root: scrollContainerRef.current,
    threshold: 1
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["kanban-tasks", status, filters],
      queryFn: async ({ pageParam = 1 }) => {
        const resp = await searchTasks({
          page: pageParam,
          limit: 10,
          status,
          ...filters
        })
        return resp.data
      },
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = allPages.length
        return currentPage < lastPage.totalPages ? currentPage + 1 : undefined
      },
      initialPageParam: 1
    })

  // Load more when intersection observer triggers
  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const tasks = data?.pages.flatMap((page) => page.data) ?? []
  const totalCount = data?.pages[0]?.totalPages
    ? data.pages[0].totalPages * 10
    : tasks.length

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="md"
      withBorder
      style={{
        minWidth: 300,
        maxWidth: 350,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 250px)",
        backgroundColor: "var(--mantine-color-gray-0)"
      }}
    >
      {/* Column Header */}
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Text fw={600} size="sm">
            {title}
          </Text>
          <Badge color={color} variant="light" size="sm">
            {totalCount}
          </Badge>
        </Group>
      </Group>

      {/* Tasks List with Scroll - Droppable Zone */}
      <Box
        ref={setNodeRef}
        style={{
          flex: 1,
          position: "relative",
          backgroundColor: isOver ? "rgba(17, 0, 255, 0.1)" : "transparent",
          border: isOver
            ? "2px dashed rgba(21, 0, 255, 0.5)"
            : "2px dashed transparent",
          borderRadius: "8px",
          transition: "all 0.2s ease"
        }}
      >
        <Box
          ref={scrollContainerRef}
          style={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 100
          }}
        >
          {isLoading ? (
            <Center h={200}>
              <Loader size="sm" />
            </Center>
          ) : tasks.length === 0 ? (
            <Center h="100%" style={{ minHeight: 200 }}>
              <Text size="sm" c="dimmed">
                Kéo task vào đây
              </Text>
            </Center>
          ) : (
            <SortableContext
              items={tasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap="sm" style={{ pointerEvents: "none" }}>
                {tasks.map((task) => (
                  <div key={task._id} style={{ pointerEvents: "auto" }}>
                    <KanbanCard
                      task={task}
                      usersMap={usersMap}
                      onView={onViewTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                ))}

                {/* Intersection observer target for infinite scroll */}
                {hasNextPage && (
                  <div
                    ref={intersectionRef}
                    style={{ height: 20, pointerEvents: "auto" }}
                  >
                    {isFetchingNextPage && (
                      <Center>
                        <Loader size="xs" />
                      </Center>
                    )}
                  </div>
                )}
              </Stack>
            </SortableContext>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
