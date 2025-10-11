import type { ElementType } from "react"
import { Tooltip, UnstyledButton, Text } from "@mantine/core"
import { Link } from "@tanstack/react-router"

export type IconComponent = ElementType

type SidebarItemProps = {
  to: string
  label: string
  Icon: IconComponent
  active: boolean
}

export function SidebarItem({ to, label, Icon, active }: SidebarItemProps) {
  const displayLabel = label.length > 5 ? label.slice(0, 5) + "..." : label
  return (
    <Tooltip label={label} withArrow position="right">
      <UnstyledButton
        component={Link}
        to={to}
        h={66}
        aria-current={active ? "page" : undefined}
        style={{
          width: "100%",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
          transition:
            "transform 120ms ease, background-color 160ms ease, box-shadow 160ms ease",
          transform: active ? "translateX(0)" : undefined,
          background: "transparent"
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Icon
          size={18}
          style={{
            color: active
              ? "var(--mantine-color-indigo-5)"
              : "rgba(0, 0, 0, 0.82)",
            filter: active
              ? "drop-shadow(0 0 12px rgba(99,102,241,0.85)) drop-shadow(0 0 12px rgba(99,102,241,0.35))"
              : "none"
          }}
        />
        <Text
          size="10"
          c={active ? "indigo.4" : "dimmed"}
          w={82}
          ta="center"
          style={{ lineHeight: 1 }}
        >
          {displayLabel}
        </Text>
      </UnstyledButton>
    </Tooltip>
  )
}
