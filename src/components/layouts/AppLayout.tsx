import { ReactNode, useMemo } from "react"
import {
  AppShell,
  Burger,
  Group,
  ActionIcon,
  Text,
  TextInput,
  ScrollArea,
  Button,
  Menu,
  Avatar,
  Indicator,
  Box,
  Tooltip,
  Kbd,
  Stack,
  Paper,
  UnstyledButton
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  IconSearch,
  IconBell,
  IconListCheck,
  IconCalendarEvent,
  IconClockHour4,
  IconLogout,
  IconUserCircle,
  IconHome2
} from "@tabler/icons-react"
import { useEnsureAuth } from "../../hooks/use-ensure-auth"
import { useAuthStore } from "../../stores/authState"
import { useAuth } from "../../hooks/use-auth"

interface AppLayoutProps {
  children: ReactNode
}

const SidebarItem = ({
  to,
  label,
  Icon,
  active
}: {
  to: string
  label: string
  Icon: React.ElementType
  active: boolean
}) => {
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
          background: active
            ? "linear-gradient(180deg, rgba(99,102,241,.18) 0%, rgba(99,102,241,.10) 100%)"
            : "transparent",
          boxShadow: active
            ? "0 0 0 1px rgba(99,102,241,.45), 0 8px 22px rgba(99,102,241,.30)"
            : "none"
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
              : "rgba(0, 0, 0, 0.82)"
          }}
        />
        <Text
          size="10"
          c={active ? "indigo.4" : "dimmed"}
          w={82}
          ta="center"
          style={{ lineHeight: 1 }}
        >
          {label}
        </Text>
      </UnstyledButton>
    </Tooltip>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  // Guard: kick to login if not authenticated
  useEnsureAuth({ redirectTo: "/" })

  const [opened, { toggle }] = useDisclosure()
  const { logout } = useAuth()
  const user = useAuthStore((s) => s.user)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const navItems = useMemo(
    () => [
      { label: "Tổng quan", to: "/home", icon: IconHome2 },
      { label: "Nhiệm vụ", to: "/tasks", icon: IconListCheck },
      { label: "Lịch", to: "/calendar", icon: IconCalendarEvent },
      {
        label: "Thời gian làm việc",
        to: "/time-tracking",
        icon: IconClockHour4
      }
    ],
    []
  )

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 120,
        breakpoint: "sm",
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header
        withBorder
        style={{
          backdropFilter: "saturate(180%) blur(6px)",
          background: "rgba(255,255,255,0.7)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}
      >
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              h={36}
            />
            {/* Removed expand/collapse toggle for sidebar */}
            <Button
              variant="subtle"
              component={Link}
              to="/home"
              px="xs"
              h={36}
              radius="xl"
            >
              <Text fw={700}>TCM MyCandy</Text>
            </Button>
          </Group>

          <Box style={{ flex: 1 }} px="md">
            <TextInput
              maw={440}
              placeholder="Tìm kiếm..."
              leftSection={<IconSearch size={16} />}
              leftSectionWidth={36}
              radius="xl"
              size="sm"
              className="mx-auto"
              rightSection={<Kbd>⌘K</Kbd>}
              rightSectionWidth={46}
              styles={{
                input: {
                  margin: "0 auto",
                  paddingLeft: 40,
                  paddingRight: 50
                },
                section: { pointerEvents: "none" }
              }}
            />
          </Box>

          <Group wrap="nowrap" gap="xs">
            <Tooltip label="Thông báo" withArrow>
              <Indicator
                position="top-end"
                offset={8}
                size={10}
                color="red"
                withBorder
              >
                <ActionIcon
                  variant="subtle"
                  aria-label="Notifications"
                  radius="xl"
                  size={36}
                >
                  <IconBell size={20} />
                </ActionIcon>
              </Indicator>
            </Tooltip>

            <Menu shadow="md" width={280} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="light"
                  radius="xl"
                  size="compact-md"
                  h={36}
                  leftSection={
                    <Avatar radius="xl" size={22} src={user?.avatar} />
                  }
                  styles={() => ({ root: { paddingLeft: 6, paddingRight: 8 } })}
                >
                  <Stack gap={0} align="flex-start">
                    <Text size="sm" fw={600} lh={1.1}>
                      {user?.name ?? "Tài khoản"}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.1}>
                      {user?.email ?? ""}
                    </Text>
                  </Stack>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUserCircle size={16} />}>
                  Hồ sơ
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  onClick={() => logout()}
                >
                  Đăng xuất
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{ background: "transparent", border: "none" }}
      >
        <ScrollArea type="auto" style={{ height: "100%" }}>
          <Paper
            withBorder
            shadow="sm"
            radius="xl"
            p="sm"
            style={{ height: "100%" }}
          >
            <Stack gap="xs">
              {navItems.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(item.to)
                return (
                  <SidebarItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    Icon={item.icon}
                    active={active}
                  />
                )
              })}
            </Stack>
          </Paper>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
