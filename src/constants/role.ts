export type Role = "user" | "admin" | "superadmin"

export const ROLE_OPTIONS: { value: Role; label: string; color: string }[] = [
  { value: "user", label: "User", color: "gray" },
  { value: "admin", label: "Admin", color: "blue" },
  { value: "superadmin", label: "Super Admin", color: "red" }
]

export const getRoleLabel = (role: Role): string => {
  const option = ROLE_OPTIONS.find((opt) => opt.value === role)
  return option?.label || role
}

export const getRoleColor = (role: Role): string => {
  const option = ROLE_OPTIONS.find((opt) => opt.value === role)
  return option?.color || "gray"
}
