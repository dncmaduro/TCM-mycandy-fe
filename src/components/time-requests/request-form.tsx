import { useForm, Controller, FormProvider } from "react-hook-form"
import type { ITimeRequest } from "../../types/interfaces"
import { CreateTimeRequestRequest } from "../../types/models"
import {
  Button,
  Group,
  Stack,
  Select,
  Textarea,
  NumberInput
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { DatePickerInput } from "@mantine/dates"

interface TimeRequestFormProps {
  request?: ITimeRequest
  onSubmit: (data: any) => void
  isLoading: boolean
}

export function TimeRequestForm({
  request,
  onSubmit,
  isLoading
}: TimeRequestFormProps) {
  const form = useForm<CreateTimeRequestRequest>({
    defaultValues: {
      type: request?.type || "overtime",
      reason: request?.reason || "",
      minutes: request?.minutes || undefined,
      date: request?.date || new Date()
    }
  })

  const selectedType = form.watch("type")

  const handleSubmit = (values: CreateTimeRequestRequest) => {
    const payload = {
      ...values,
      minutes: selectedType === "day_off" ? undefined : values.minutes
    }
    onSubmit(payload)
  }

  const typeOptions = [
    { value: "overtime", label: "Tăng ca" },
    { value: "day_off", label: "Nghỉ phép" },
    { value: "remote_work", label: "Làm từ xa" },
    { value: "leave_early", label: "Về sớm" },
    { value: "late_arrival", label: "Đến muộn" }
  ]

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack gap="md">
          <Controller
            name="type"
            control={form.control}
            rules={{ required: "Loại yêu cầu là bắt buộc" }}
            render={({ field }) => (
              <Select
                label="Loại yêu cầu"
                placeholder="Chọn loại yêu cầu"
                data={typeOptions}
                {...field}
                required
              />
            )}
          />

          <Controller
            name="reason"
            control={form.control}
            rules={{ required: "Lý do là bắt buộc" }}
            render={({ field }) => (
              <Textarea
                label="Lý do"
                placeholder="Nhập lý do chi tiết"
                minRows={3}
                {...field}
                required
              />
            )}
          />

          {selectedType !== "day_off" && (
            <Controller
              name="minutes"
              control={form.control}
              rules={{
                required: "Thời gian là bắt buộc",
                min: { value: 1, message: "Thời gian phải lớn hơn 0" }
              }}
              render={({ field }) => (
                <NumberInput
                  label="Thời gian (phút)"
                  placeholder="Nhập số phút"
                  min={1}
                  {...field}
                  required
                />
              )}
            />
          )}

          <Controller
            name="date"
            control={form.control}
            rules={{ required: "Ngày là bắt buộc" }}
            render={({ field }) => (
              <DatePickerInput
                label="Ngày"
                {...field}
                required
                valueFormat="DD/MM/YYYY"
              />
            )}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => modals.closeAll()}>
              Hủy
            </Button>
            <Button type="submit" loading={isLoading}>
              {request ? "Cập nhật" : "Tạo"}
            </Button>
          </Group>
        </Stack>
      </form>
    </FormProvider>
  )
}
