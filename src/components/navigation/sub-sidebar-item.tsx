import { UnstyledButton, Text } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import type { IconComponent } from "./sidebar-item"

type SubSidebarItemProps = {
  to: string
  label: string
  Icon: IconComponent
  active: boolean
}

export function SubSidebarItem({
  to,
  label,
  Icon,
  active
}: SubSidebarItemProps) {
  return (
    <UnstyledButton
      component={Link}
      to={to}
      aria-current={active ? "page" : undefined}
      style={{
        padding: "0px 8px",
        borderRadius: 8,
        display: "flex",
        height: 38,
        alignItems: "center",
        gap: 10,
        transition: "background-color 150ms ease",
        background: active ? "rgba(99,102,241,.12)" : "transparent"
      }}
    >
      <Icon
        size={16}
        style={{
          color: active
            ? "var(--mantine-color-indigo-6)"
            : "var(--mantine-color-dimmed)"
        }}
      />
      <Text
        size="sm"
        c={active ? "indigo" : "gray.8"}
        lineClamp={1}
        style={{ lineHeight: 1 }}
      >
        {label}
      </Text>
    </UnstyledButton>
  )
}
