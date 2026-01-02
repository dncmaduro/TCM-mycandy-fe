import {
  Avatar,
  Button,
  Group,
  Select,
  SelectProps,
  Stack,
  Textarea,
  TextInput,
  Text,
  Badge,
  NumberInput
} from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { modals } from "@mantine/modals"
import { Controller, useFormContext } from "react-hook-form"
import { CreateTaskRequest } from "../../types/models"
import { useProfile } from "../../hooks/use-profile"
import { useTaskTags } from "../../hooks/use-task-tags"
import { useSprints } from "../../hooks/use-sprints"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { IconCheck } from "@tabler/icons-react"
import { ITask } from "../../types/interfaces"
import { TagsCombobox } from "./tags-combobox"

interface TaskModalProps {
  task?: ITask
}

export const TaskModal = ({ task }: TaskModalProps) => {
  const form = useFormContext<CreateTaskRequest>()
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        aim: task.aim,
        aimUnit: task.aimUnit,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        assignedTo: task.assignedTo?._id || undefined,
        tags: task.tags || [],
        sprint: task.sprint._id || "",
        estimateHours: task.estimateHours || 0,
        evaluation: task.evaluation || ""
      })
    }
  }, [task])
  const { getAllProfiles } = useProfile()
  const { searchTaskTags } = useTaskTags()
  const { getSprints } = useSprints()

  const { data: profilesData } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: () => getAllProfiles({ page: 1, limit: 300, status: "active" }),
    staleTime: Infinity
  })

  const { data: tagsData } = useQuery({
    queryKey: ["active-task-tags"],
    queryFn: async () => {
      const resp = await searchTaskTags({ deleted: false, limit: 100, page: 1 })
      return resp.data
    },
    staleTime: Infinity
  })

  const { data: sprintsData } = useQuery({
    queryKey: ["sprints-select"],
    queryFn: async () => {
      const resp = await getSprints({ limit: 50 })
      return resp.data
    },
    staleTime: Infinity
  })

  const activeTags = useMemo(() => {
    return tagsData?.data ?? []
  }, [tagsData])

  const sprintsOptions = useMemo(() => {
    return (
      sprintsData?.data
        .filter((sprint) => !sprint.deletedAt)
        .map((sprint) => ({
          value: sprint._id,
          label: sprint.name
        })) || []
    )
  }, [sprintsData])

  const usersOptions = useMemo(() => {
    return (
      profilesData?.data.data.map((profile) => ({
        value: profile._id,
        label: profile.name ?? profile.accountId
      })) || []
    )
  }, [profilesData])

  const renderOption: SelectProps["renderOption"] = ({ option, checked }) => {
    const profile = profilesData?.data.data.find(
      (p) => p.accountId === option.value
    )
    if (!profile) return option.label
    return (
      <Group gap="sm">
        <Avatar src={profile.avatarUrl} radius="xl" size={20} />
        <Stack gap={0}>
          <Text>{option.label}</Text>
          <Text size="xs" c="dimmed">
            {profile.accountId}
          </Text>
        </Stack>
        {checked && <IconCheck size={16} />}
      </Group>
    )
  }

  const prioritiesOptions = [
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
    { value: "urgent", label: "Khẩn cấp" }
  ]

  const priorityRenderOption: SelectProps["renderOption"] = ({
    option,
    checked
  }) => {
    const color =
      option.value === "low"
        ? "blue"
        : option.value === "medium"
          ? "green"
          : option.value === "high"
            ? "orange"
            : option.value === "urgent"
              ? "red"
              : "gray"

    if (!color) return option.label
    return (
      <Group justify="apart">
        <Badge variant="light" color={color}>
          {option.label}
        </Badge>
        {checked && <IconCheck size={16} />}
      </Group>
    )
  }

  return (
    <>
      <Stack gap="md">
        <Controller
          name="title"
          control={form.control}
          rules={{ required: "Tiêu đề là bắt buộc" }}
          render={({ field }) => (
            <TextInput
              label="Tiêu đề"
              placeholder="Nhập tiêu đề"
              {...field}
              required
            />
          )}
        />

        <Controller
          name="description"
          control={form.control}
          rules={{ required: "Mô tả là bắt buộc" }}
          render={({ field }) => (
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả chi tiết"
              minRows={3}
              autosize
              {...field}
              required
            />
          )}
        />

        <Controller
          name="priority"
          control={form.control}
          rules={{ required: "Ưu tiên là bắt buộc" }}
          render={({ field }) => (
            <Select
              label="Ưu tiên"
              placeholder="Chọn mức độ ưu tiên"
              data={prioritiesOptions}
              {...field}
              renderOption={priorityRenderOption}
              required
            />
          )}
        />

        <Group grow>
          <Controller
            name="aim"
            control={form.control}
            rules={{
              required: "Mục tiêu là bắt buộc",
              min: { value: 1, message: "Mục tiêu phải lớn hơn 0" }
            }}
            render={({ field }) => (
              <NumberInput
                label="Mục tiêu"
                placeholder="Nhập số lượng mục tiêu"
                min={1}
                {...field}
                onChange={(value) => field.onChange(value)}
                required
              />
            )}
          />

          <Controller
            name="aimUnit"
            control={form.control}
            render={({ field }) => (
              <TextInput
                label="Đơn vị"
                placeholder="VD: videos, bugs, pages..."
                {...field}
              />
            )}
          />
        </Group>

        <Controller
          name="estimateHours"
          control={form.control}
          render={({ field }) => (
            <NumberInput
              label="Ước lượng thời gian (giờ)"
              placeholder="Nhập số giờ"
              min={0}
              {...field}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />

        <Controller
          name="dueDate"
          control={form.control}
          rules={{ required: "Deadline là bắt buộc" }}
          render={({ field }) => (
            <DateTimePicker
              label="Deadline"
              placeholder="Chọn ngày giờ"
              {...field}
              required
            />
          )}
        />

        <Controller
          name="assignedTo"
          control={form.control}
          rules={{ required: "Giao cho là bắt buộc" }}
          render={({ field }) => (
            <Select
              label="Giao cho"
              placeholder="Chọn người thực hiện"
              data={usersOptions}
              {...field}
              renderOption={renderOption}
              searchable
              clearable
              required
            />
          )}
        />

        <Controller
          name="sprint"
          control={form.control}
          rules={{ required: "Sprint là bắt buộc" }}
          render={({ field }) => (
            <Select
              label="Sprint"
              placeholder="Chọn Sprint"
              data={sprintsOptions}
              {...field}
              searchable
              clearable
              required
            />
          )}
        />

        <Controller
          name="tags"
          control={form.control}
          render={({ field }) => (
            <TagsCombobox
              label="Phân loại"
              placeholder="Chọn thẻ phân loại"
              tags={activeTags}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="evaluation"
          control={form.control}
          render={({ field }) => (
            <Textarea
              label="Đánh giá"
              placeholder="Nhập đánh giá"
              minRows={3}
              autosize
              {...field}
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={() => modals.closeAll()}>
            Hủy
          </Button>
          <Button type="submit">Lưu</Button>
        </Group>
      </Stack>
    </>
  )
}
