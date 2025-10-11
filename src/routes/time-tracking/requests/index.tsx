import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"

export const Route = createFileRoute("/time-tracking/requests/")({
  component: RouteComponent
})

function RouteComponent() {
  return <AppLayout>Hello "/time-tracking/requests/"!</AppLayout>
}
