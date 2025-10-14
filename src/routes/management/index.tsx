import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "../../stores/authState"
import { useEffect } from "react"
import { getFirstSubMenuPath } from "../../components/navigation/menuConfig"

export const Route = createFileRoute("/management/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const role = (useAuthStore((s) => s.user) as any)?.role
  useEffect(() => {
    const first = getFirstSubMenuPath("/management", role)
    if (first) navigate({ to: first })
  }, [navigate, role])
  return <div>Hello "/management/"!</div>
}
