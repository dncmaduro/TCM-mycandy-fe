import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { useEffect } from "react"
import { getFirstSubMenuPath } from "../../components/navigation/menuConfig"
import { useAuthStore } from "../../stores/authState"

export const Route = createFileRoute("/tasks/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const role = (useAuthStore((s) => s.user) as any)?.role
  useEffect(() => {
    const first = getFirstSubMenuPath("/tasks", role)
    if (first) navigate({ to: first })
  }, [navigate, role])
  return <AppLayout />
}
