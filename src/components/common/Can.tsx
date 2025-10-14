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

  const fetchedRole = data?.data.role as Role | undefined

  const allowed = Array.isArray(roles)
    ? !!fetchedRole && roles.includes(fetchedRole)
    : fetchedRole === roles

  return <>{allowed ? children : fallback}</>
}
