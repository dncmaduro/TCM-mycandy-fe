import { ReactNode } from "react"
import {
  AppShell,
  Burger,
  Group,
  ActionIcon,
  Text,
  TextInput,
  Button,
  Menu,
  Avatar,
  Indicator,
  Box,
  Tooltip,
  Kbd,
  Stack,
  Paper
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  IconSearch,
  IconBell,
  IconLogout,
  IconUserCircle
} from "@tabler/icons-react"
import { useEnsureAuth } from "../../hooks/use-ensure-auth"
import { useAuth } from "../../hooks/use-auth"
import { SidebarItem } from "../navigation/sidebar-item"
import { SubSidebarItem } from "../navigation/sub-sidebar-item"
import {
  SECTION_KEYS,
  type SectionKey,
  type MenuItem,
  getVisibleNavItems,
  getVisibleSubMenu
} from "../navigation/menu-config"
import { useRoles } from "../../hooks/use-roles"
import { useQuery } from "@tanstack/react-query"
import { Role } from "../../constants/role"
import { useUsers } from "../../hooks/use-users"

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  // Guard: kick to login if not authenticated
  useEnsureAuth({ redirectTo: "/" })

  const [opened, { toggle }] = useDisclosure()
  const { logout } = useAuth()
  const { getOwnRole } = useRoles()
  const { getMe } = useUsers()
  const { data: roleData } = useQuery({
    queryKey: ["own-role"],
    queryFn: () => getOwnRole(),
    staleTime: Infinity
  })
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    staleTime: Infinity
  })
  const role = (roleData?.data.role || "user") as Role
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const currentSection: SectionKey | undefined = SECTION_KEYS.find((k) =>
    pathname.startsWith(k)
  )
  const visibleNav = getVisibleNavItems(role)
  const currentSubmenu: MenuItem[] = currentSection
    ? getVisibleSubMenu(currentSection, role)
    : []

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 64,
        breakpoint: "sm",
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header
        withBorder
        style={{
          backdropFilter: "saturate(180%) blur(6px)",
          background: "rgba(246,247,249,0.85)",
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
                    <Avatar
                      radius="xl"
                      size={22}
                      src={meData?.data.user.avatarUrl}
                    />
                  }
                  styles={() => ({ root: { paddingLeft: 6, paddingRight: 8 } })}
                >
                  <Stack gap={0} align="flex-start">
                    <Text size="sm" fw={600} lh={1.1}>
                      {meData?.data.user.name ?? "Tài khoản"}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.1}>
                      {meData?.data.user.email ?? ""}
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
        p="sm"
        style={{ background: "transparent", border: "none" }}
      >
        <Box>
          <Paper
            withBorder
            shadow="sm"
            radius="xl"
            p="xs"
            style={{ height: "100%" }}
          >
            <Stack gap={6} align="stretch">
              {visibleNav.map((item) => {
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
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ height: "100%" }}>
          <Group align="flex-start" gap="sm" wrap="nowrap">
            {currentSubmenu.length > 0 && (
              <Paper
                radius="md"
                p="sm"
                w={200}
                bg={"gray.0"}
                style={{
                  border: "1px solid rgba(0,0,0,0.06)",
                  position: "sticky",
                  top: 16,
                  marginLeft: -16
                }}
              >
                <Stack gap="xs">
                  {currentSubmenu.map((it) => (
                    <SubSidebarItem
                      key={it.to}
                      to={it.to}
                      label={it.label}
                      Icon={it.icon}
                      active={pathname === it.to || pathname.startsWith(it.to)}
                    />
                  ))}
                </Stack>
              </Paper>
            )}
            <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
          </Group>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
