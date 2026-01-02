import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { getFirstSubMenuPath } from "../../components/navigation/menu-config"
import { AppLayout } from "../../components/layouts/app-layout"
import { useRoles } from "../../hooks/use-roles"
import { useQuery } from "@tanstack/react-query"
import { Role } from "../../constants/role"

export const Route = createFileRoute("/management/")({
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
    const first = getFirstSubMenuPath("/management", role, roles)
    if (first) navigate({ to: first, replace: true })
  }, [navigate, role, roles])
  return <AppLayout />
}
