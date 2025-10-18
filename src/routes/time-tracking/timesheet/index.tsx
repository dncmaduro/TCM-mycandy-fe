import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/app-layout"

export const Route = createFileRoute("/time-tracking/timesheet/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AppLayout>
      Xem timesheet chấm công đang được phát triển. Vui lòng quay lại sau.
    </AppLayout>
  )
}
