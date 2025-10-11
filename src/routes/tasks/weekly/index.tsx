import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../../components/layouts/AppLayout"

export const Route = createFileRoute("/tasks/weekly/")({
  component: RouteComponent
})

function RouteComponent() {
  return <AppLayout>Hello "/tasks/weekly/"!</AppLayout>
}
