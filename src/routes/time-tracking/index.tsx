import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/app-layout"
import { useEffect } from "react"
import { getFirstSubMenuPath } from "../../components/navigation/menu-config"
import { useRoles } from "../../hooks/use-roles"
import { useQuery } from "@tanstack/react-query"
import { Role } from "../../constants/role"

export const Route = createFileRoute("/time-tracking/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { getOwnRole } = useRoles()
  const { data: roleData } = useQuery({
    queryKey: ["own-role"],
    queryFn: getOwnRole,
    staleTime: Infinity
  })

  const roles = (roleData?.data.roles || []) as Role[]
  const role = roles.includes("superadmin")
    ? "superadmin"
    : roles.includes("admin")
      ? "admin"
      : "user"

  useEffect(() => {
    const first = getFirstSubMenuPath("/time-tracking", role, roles)
    if (first) navigate({ to: first })
  }, [navigate, role, roles])
  return <AppLayout />
}
