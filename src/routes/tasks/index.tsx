import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { useEffect } from "react"
import { getFirstSubMenuPath } from "../../components/navigation/menuConfig"

export const Route = createFileRoute("/tasks/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  useEffect(() => {
    const first = getFirstSubMenuPath("/tasks")
    if (first) navigate({ to: first })
  }, [navigate])
  return <AppLayout />
}
