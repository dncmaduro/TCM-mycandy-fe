import {
  IconListCheck,
  IconCalendarEvent,
  IconClockHour4,
  IconHome2
} from "@tabler/icons-react"
import type { IconComponent } from "./SidebarItem"

export const SECTION_KEYS = ["/tasks", "/calendar", "/time-tracking"] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export type MenuItem = {
  label: string
  to: string
  icon: IconComponent
}

export const navItems: MenuItem[] = [
  { label: "Tổng quan", to: "/home", icon: IconHome2 },
  { label: "Nhiệm vụ", to: "/tasks", icon: IconListCheck },
  { label: "Lịch", to: "/calendar", icon: IconCalendarEvent },
  { label: "Thời gian làm việc", to: "/time-tracking", icon: IconClockHour4 }
]

export const subMenus: Record<SectionKey, MenuItem[]> = {
  "/tasks": [
    { label: "Nhiệm vụ trong tuần", to: "/tasks/weekly", icon: IconListCheck }
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
  ]
}

export function getFirstSubMenuPath(section: SectionKey): string | undefined {
  return subMenus[section]?.[0]?.to
}
