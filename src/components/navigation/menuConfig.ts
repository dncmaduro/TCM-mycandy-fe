import {
  IconListCheck,
  IconCalendarEvent,
  IconClockHour4,
  IconHome2,
  IconDeviceDesktopCog,
  IconUser,
  IconTags,
  IconCalendarRepeat,
  IconChartBar
} from "@tabler/icons-react"
import type { IconComponent } from "./SidebarItem"
import type { Role } from "../../constants/role"

export const SECTION_KEYS = [
  "/tasks",
  "/calendar",
  "/time-tracking",
  "/management"
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export type MenuItem = {
  label: string
  to: string
  icon: IconComponent
  allowedRoles?: Role[]
}

export const navItems: MenuItem[] = [
  { label: "Tổng quan", to: "/home", icon: IconHome2 },
  { label: "Task", to: "/tasks", icon: IconListCheck },
  { label: "Lịch", to: "/calendar", icon: IconCalendarEvent },
  { label: "Thời gian làm việc", to: "/time-tracking", icon: IconClockHour4 },
  {
    label: "Quản lý",
    to: "/management",
    icon: IconDeviceDesktopCog,
    allowedRoles: ["superadmin"]
  }
]

export const subMenus: Record<SectionKey, MenuItem[]> = {
  "/tasks": [
    { label: "Task trong tuần", to: "/tasks/weekly", icon: IconListCheck },
    {
      label: "Hiệu suất",
      to: "/tasks/performance",
      icon: IconChartBar,
      allowedRoles: ["superadmin", "admin"]
    },
    {
      label: "Thẻ phân loại",
      to: "/tasks/tags",
      icon: IconTags,
      allowedRoles: ["superadmin", "admin"]
    },
    {
      label: "Sprint",
      to: "/tasks/sprints",
      icon: IconCalendarRepeat,
      allowedRoles: ["superadmin", "admin"]
    }
  ],
  "/calendar": [
    { label: "Lịch họp", to: "/calendar/meetings", icon: IconCalendarEvent }
  ],
  "/time-tracking": [
    {
      label: "Yêu cầu cá nhân",
      to: "/time-tracking/requests",
      icon: IconClockHour4
    },
    {
      label: "Lịch nghỉ",
      to: "/time-tracking/timeoff",
      icon: IconCalendarEvent
    }
  ],
  "/management": [
    {
      label: "Người dùng",
      to: "/management/users",
      icon: IconUser,
      allowedRoles: ["superadmin"]
    }
  ]
}

export function isAllowed(item: MenuItem, role?: Role) {
  if (!item.allowedRoles || item.allowedRoles.length === 0) return true
  if (!role) return false
  return item.allowedRoles.includes(role)
}

export function getVisibleNavItems(role?: Role): MenuItem[] {
  return navItems.filter((i) => isAllowed(i, role))
}

export function getVisibleSubMenu(
  section: SectionKey,
  role?: Role
): MenuItem[] {
  console.log(
    role,
    subMenus[section],
    subMenus[section]?.filter((i) => isAllowed(i, role))
  )
  return (subMenus[section] ?? []).filter((i) => isAllowed(i, role))
}

export function getFirstSubMenuPath(
  section: SectionKey,
  role?: Role
): string | undefined {
  return getVisibleSubMenu(section, role)[0]?.to
}
