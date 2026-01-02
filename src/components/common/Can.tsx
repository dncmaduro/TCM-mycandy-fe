import { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRoles } from "../../hooks/use-roles"
import type { Role } from "../../constants/role"

interface CanProps {
  roles: Role | Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ roles, children, fallback = null }: CanProps) {
  const { getOwnRole } = useRoles()

  const { data, isLoading } = useQuery({
    queryKey: ["fetched-role"],
    queryFn: () => getOwnRole()
  })

  if (isLoading) return <>{fallback}</>

  const fetchedRoles = (data?.data.roles || []) as Role[]

  // Kiểm tra xem user có ít nhất 1 role được phép không
  const allowed = Array.isArray(roles)
    ? fetchedRoles.some((userRole) => roles.includes(userRole))
    : fetchedRoles.includes(roles)

  return <>{allowed ? children : fallback}</>
}
