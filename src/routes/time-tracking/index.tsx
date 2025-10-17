import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { useEffect } from "react"
import { getFirstSubMenuPath } from "../../components/navigation/menuConfig"
import { useRoles } from "../../hooks/use-roles"
import { useQuery } from "@tanstack/react-query"
import { Role } from "../../constants/role"

export const Route = createFileRoute("/time-tracking/")({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { getOwnRole } = useRoles()
  const { data: role } = useQuery({
    queryKey: ["own-role"],
    queryFn: getOwnRole,
    staleTime: Infinity,
    select: (data) => data.data.role
  })
  useEffect(() => {
    const first = getFirstSubMenuPath("/time-tracking", role as Role)
    if (first) navigate({ to: first })
  }, [navigate, role])
  return <AppLayout />
}
