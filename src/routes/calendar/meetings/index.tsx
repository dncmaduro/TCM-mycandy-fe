import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"

export const Route = createFileRoute("/calendar/meetings/")({
  component: RouteComponent
})

function RouteComponent() {
  return <AppLayout>Hello "/calendar/meetings/"!</AppLayout>
}
