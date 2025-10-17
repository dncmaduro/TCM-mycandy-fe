import { useState } from "react"
import {
  Button,
  Group,
  Select,
  TextInput,
  Popover,
  Stack,
  ActionIcon,
  Badge,
  Text,
  MultiSelect
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconFilter, IconX, IconSearch } from "@tabler/icons-react"
import type { TaskPriority, TaskStatus } from "../../types/interfaces"
import type { SearchTasksParams } from "../../types/models"

export interface TaskFiltersProps {
  onFiltersChange: (filters: Omit<SearchTasksParams, "page" | "limit">) => void
  users: Array<{ _id: string; name: string }>
  sprints?: Array<{ _id: string; name: string }>
  initialFilters?: Omit<SearchTasksParams, "page" | "limit">
  view: "kanban" | "list"
}

export function TaskFilters({
  onFiltersChange,
  users,
  sprints = [],
  initialFilters = {},
  view
}: TaskFiltersProps) {
  const [opened, setOpened] = useState(false)
  const [filters, setFilters] =
    useState<Omit<SearchTasksParams, "page" | "limit">>(initialFilters)

  const statusOptions = [
    { value: "new", label: "Mới" },
    { value: "in_progress", label: "Đang làm" },
    { value: "completed", label: "Hoàn thành" },
    { value: "archived", label: "Lưu trữ" },
    { value: "canceled", label: "Hủy" },
    { value: "reviewing", label: "Đang review" }
  ]

  const priorityOptions = [
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
    { value: "urgent", label: "Khẩn cấp" }
  ]

  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.name
  }))

  const sprintOptions = sprints.map((sprint) => ({
    value: sprint._id,
    label: sprint.name
  }))

  const updateFilter = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilter = (key: keyof typeof filters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof typeof filters]
    return value !== undefined && value !== null && value !== ""
  }).length

  return (
    <Group gap="xs" align="flex-end">
      {/* Search input */}
      <TextInput
        placeholder="Tìm kiếm task..."
        leftSection={<IconSearch size={16} />}
        value={filters.searchText || ""}
        onChange={(e) => updateFilter("searchText", e.currentTarget.value)}
        style={{ minWidth: 200 }}
      />

      {/* Filter popover */}
      <Popover
        onClose={() => setOpened(false)}
        clickOutsideEvents={["mouseup", "touchend"]}
        position="bottom-start"
        shadow="md"
      >
        <Popover.Target>
          <Button
            variant="light"
            leftSection={<IconFilter size={16} />}
            rightSection={
              activeFiltersCount > 0 ? (
                <Badge size="xs" color="blue" variant="filled">
                  {activeFiltersCount}
                </Badge>
              ) : undefined
            }
            onClick={() => setOpened(!opened)}
          >
            Bộ lọc
          </Button>
        </Popover.Target>
        <Popover.Dropdown style={{ width: 300 }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600} size="sm">
                Bộ lọc nâng cao
              </Text>
              {activeFiltersCount > 0 && (
                <Button variant="subtle" size="xs" onClick={clearAllFilters}>
                  Xóa tất cả
                </Button>
              )}
            </Group>

            {/* Assigned To */}
            <Select
              label="Người được giao"
              placeholder="Chọn người được giao"
              data={userOptions}
              value={filters.assignedTo || null}
              onChange={(value) => updateFilter("assignedTo", value)}
              clearable
              searchable
            />

            {/* Created By */}
            <Select
              label="Người tạo"
              placeholder="Chọn người tạo"
              data={userOptions}
              value={filters.createdBy || null}
              onChange={(value) => updateFilter("createdBy", value)}
              clearable
              searchable
            />

            {/* Status */}
            {view === "list" && (
              <Select
                label="Trạng thái"
                placeholder="Chọn trạng thái"
                data={statusOptions}
                value={filters.status || null}
                onChange={(value) =>
                  updateFilter("status", value as TaskStatus)
                }
                clearable
              />
            )}

            {/* Priority */}
            <Select
              label="Độ ưu tiên"
              placeholder="Chọn độ ưu tiên"
              data={priorityOptions}
              value={filters.priority || null}
              onChange={(value) =>
                updateFilter("priority", value as TaskPriority)
              }
              clearable
            />

            {/* Sprint */}
            <Select
              label="Sprint"
              placeholder="Chọn Sprint"
              data={sprintOptions}
              value={filters.sprint || null}
              onChange={(value) => updateFilter("sprint", value)}
              clearable
              searchable
            />

            {/* Due Date Range */}
            <Group grow>
              <DateInput
                label="Hạn từ ngày"
                placeholder="Chọn ngày"
                value={filters.dueAfter ? new Date(filters.dueAfter) : null}
                onChange={(value: Date | null) =>
                  updateFilter("dueAfter", value?.toISOString())
                }
                clearable
              />
              <DateInput
                label="Hạn đến ngày"
                placeholder="Chọn ngày"
                value={filters.dueBefore ? new Date(filters.dueBefore) : null}
                onChange={(value: Date | null) =>
                  updateFilter("dueBefore", value?.toISOString())
                }
                clearable
              />
            </Group>

            {/* Tags */}
            <MultiSelect
              label="Tags"
              placeholder="Nhập và chọn tags"
              data={[]} // TODO: Load from API or predefined list
              value={filters.tags || []}
              onChange={(value: string[]) => updateFilter("tags", value)}
              searchable
            />
          </Stack>
        </Popover.Dropdown>
      </Popover>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <Group gap="xs">
          {filters.assignedTo && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => clearFilter("assignedTo")}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Giao: {users.find((u) => u._id === filters.assignedTo)?.name}
            </Badge>
          )}

          {filters.createdBy && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => clearFilter("createdBy")}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Tạo: {users.find((u) => u._id === filters.createdBy)?.name}
            </Badge>
          )}

          {filters.status && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => clearFilter("status")}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Trạng thái:{" "}
              {statusOptions.find((s) => s.value === filters.status)?.label}
            </Badge>
          )}

          {filters.priority && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => clearFilter("priority")}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Ưu tiên:{" "}
              {priorityOptions.find((p) => p.value === filters.priority)?.label}
            </Badge>
          )}

          {filters.sprint && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => clearFilter("sprint")}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Sprint: {sprints.find((s) => s._id === filters.sprint)?.name}
            </Badge>
          )}

          {(filters.dueAfter || filters.dueBefore) && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => {
                    clearFilter("dueAfter")
                    clearFilter("dueBefore")
                  }}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Hạn:{" "}
              {filters.dueAfter &&
                new Date(filters.dueAfter).toLocaleDateString("vi-VN")}
              {filters.dueAfter && filters.dueBefore && " - "}
              {filters.dueBefore &&
                new Date(filters.dueBefore).toLocaleDateString("vi-VN")}
            </Badge>
          )}

          {filters.tags && filters.tags.length > 0 && (
            <Badge
              variant="outline"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => clearFilter("tags")}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Tags: {filters.tags.join(", ")}
            </Badge>
          )}
        </Group>
      )}
    </Group>
  )
}
