import { useMemo, useCallback } from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  NodeProps
} from "reactflow"
import "reactflow/dist/style.css"
import {
  Avatar,
  Badge,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Divider
} from "@mantine/core"

type ManagementRelation = {
  manager: {
    _id: string
    name?: string
    avatarUrl?: string
  }
  employee: {
    _id: string
    name?: string
    avatarUrl?: string
  }
}

interface NetworkGraphProps {
  managements: ManagementRelation[]
  profiles: any[]
}

// Custom node component
function ProfileNode({ data, isConnectable }: NodeProps<any>) {
  const { profile, managerCount, employeeCount } = data

  const nodeColor =
    employeeCount > 0 && managerCount === 0
      ? "#fa5252" // Top level - red
      : employeeCount > 0 && managerCount > 0
        ? "#228be6" // Middle - blue
        : employeeCount === 0 && managerCount > 0
          ? "#40c057" // Employee - green
          : "#868e96" // Isolated - gray

  return (
    <div style={{ width: 270 }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ width: 10, height: 10, opacity: 0 }}
      />

      <Card
        shadow="md"
        padding="sm"
        radius="md"
        withBorder
        style={{
          minWidth: 180,
          maxWidth: 200,
          borderColor: nodeColor,
          borderWidth: 3,
          background: "white"
        }}
      >
        <Stack gap="xs">
          <Group gap="xs" wrap="nowrap">
            <Avatar src={profile.avatarUrl} radius="xl" size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" fw={700} lineClamp={1}>
                {profile.name || "Unknown"}
              </Text>
              <Text size="10px" c="dimmed" lineClamp={1}>
                {profile._id}
              </Text>
            </div>
          </Group>

          {(managerCount > 0 || employeeCount > 0) && (
            <Group gap={4}>
              {managerCount > 0 && (
                <Badge size="xs" variant="light" color="green">
                  ↑ {managerCount}
                </Badge>
              )}
              {employeeCount > 0 && (
                <Badge size="xs" variant="light" color="blue">
                  ↓ {employeeCount}
                </Badge>
              )}
            </Group>
          )}
        </Stack>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ width: 10, height: 10, opacity: 0 }}
      />
    </div>
  )
}

const nodeTypes = {
  profile: ProfileNode
}

export function NetworkGraph({ managements, profiles }: NetworkGraphProps) {
  // Build graph data
  const { initialNodes, initialEdges, stats } = useMemo(() => {
    const profileMap = new Map<
      string,
      {
        profile: any
        managerCount: number
        employeeCount: number
        x?: number
        y?: number
      }
    >()

    // Initialize profiles
    profiles.forEach((profile) => {
      profileMap.set(profile._id, {
        profile,
        managerCount: 0,
        employeeCount: 0
      })
    })

    // Count relationships
    managements.forEach((mgmt) => {
      const manager = profileMap.get(mgmt.manager._id)
      const employee = profileMap.get(mgmt.employee._id)

      if (manager) manager.employeeCount++
      if (employee) employee.managerCount++
    })

    const allProfiles = Array.from(profileMap.values())

    // Group by role
    const topLevel = allProfiles.filter(
      (p) => p.employeeCount > 0 && p.managerCount === 0
    )
    const middle = allProfiles.filter(
      (p) => p.employeeCount > 0 && p.managerCount > 0
    )
    const employees = allProfiles.filter(
      (p) => p.employeeCount === 0 && p.managerCount > 0
    )
    const isolated = allProfiles.filter(
      (p) => p.employeeCount === 0 && p.managerCount === 0
    )

    // Calculate positions in layers
    const nodes: Node[] = []
    const layerGap = 250
    const nodeGap = 220

    // Top level (y = 0)
    topLevel.forEach((p, i) => {
      nodes.push({
        id: p.profile._id,
        type: "profile",
        position: {
          x: i * nodeGap - (topLevel.length * nodeGap) / 2,
          y: 0
        },
        data: p,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    })

    // Middle managers (y = 250)
    middle.forEach((p, i) => {
      nodes.push({
        id: p.profile._id,
        type: "profile",
        position: {
          x: i * nodeGap - (middle.length * nodeGap) / 2,
          y: layerGap
        },
        data: p,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    })

    // Employees (y = 500)
    employees.forEach((p, i) => {
      nodes.push({
        id: p.profile._id,
        type: "profile",
        position: {
          x: i * nodeGap - (employees.length * nodeGap) / 2,
          y: layerGap * 2
        },
        data: p,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    })

    // Isolated (y = 750)
    isolated.forEach((p, i) => {
      nodes.push({
        id: p.profile._id,
        type: "profile",
        position: {
          x: i * nodeGap - (isolated.length * nodeGap) / 2,
          y: layerGap * 3
        },
        data: p,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    })

    // Create edges
    const edges: Edge[] = managements.map((mgmt, idx) => ({
      id: `edge-${idx}`,
      source: mgmt.manager._id,
      target: mgmt.employee._id,
      type: "profile",
      animated: true,
      style: {
        stroke: "#228be6",
        strokeWidth: 3,
        strokeOpacity: 0.8
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#228be6",
        width: 20,
        height: 20
      },
      labelStyle: {
        fill: "#228be6",
        fontWeight: 500,
        fontSize: 10
      },
      labelBgStyle: {
        fill: "white",
        fillOpacity: 0.8
      }
    }))

    console.log(
      edges.filter(
        (e) =>
          !nodes.some((n) => n.id === e.source) ||
          !nodes.some((n) => n.id === e.target)
      )
    )

    // Stats
    const totalProfiles = allProfiles.length
    const nodesWithManagers = allProfiles.filter(
      (p) => p.managerCount > 0
    ).length
    const nodesWithEmployees = allProfiles.filter(
      (p) => p.employeeCount > 0
    ).length
    const nodesWithMultiple = allProfiles.filter(
      (p) => p.managerCount > 1
    ).length
    const nodesWithBoth = allProfiles.filter(
      (p) => p.managerCount > 0 && p.employeeCount > 0
    ).length

    return {
      initialNodes: nodes,
      initialEdges: edges,
      stats: {
        totalProfiles,
        nodesWithManagers,
        nodesWithEmployees,
        nodesWithMultiple,
        nodesWithBoth
      }
    }
  }, [managements, profiles])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onInit = useCallback((reactFlowInstance: any) => {
    reactFlowInstance.fitView({ padding: 0.2 })
  }, [])

  if (initialNodes.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          Chưa có dữ liệu mạng lưới quản lý
        </Text>
      </Paper>
    )
  }

  return (
    <Stack gap="md">
      {/* Statistics */}
      <Paper p="md" withBorder>
        <Title order={4} mb="sm">
          Thống kê mạng lưới quản lý
        </Title>
        <Group gap="xl" wrap="wrap">
          <div>
            <Text size="xs" c="dimmed">
              Tổng số người
            </Text>
            <Text size="xl" fw={700}>
              {stats.totalProfiles}
            </Text>
          </div>
          <Divider orientation="vertical" />
          <div>
            <Text size="xs" c="dimmed">
              Có nhân viên
            </Text>
            <Text size="xl" fw={700} c="blue">
              {stats.nodesWithEmployees}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Có manager
            </Text>
            <Text size="xl" fw={700} c="green">
              {stats.nodesWithManagers}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Nhiều managers
            </Text>
            <Text size="xl" fw={700} c="orange">
              {stats.nodesWithMultiple}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Vừa quản lý & được quản lý
            </Text>
            <Text size="xl" fw={700} c="violet">
              {stats.nodesWithBoth}
            </Text>
          </div>
        </Group>
      </Paper>

      {/* Legend */}
      <Paper p="sm" withBorder>
        <Group gap="lg">
          <Group gap="xs">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#fa5252",
                borderRadius: 4
              }}
            />
            <Text size="xs">Top Level Managers</Text>
          </Group>
          <Group gap="xs">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#228be6",
                borderRadius: 4
              }}
            />
            <Text size="xs">Middle Managers</Text>
          </Group>
          <Group gap="xs">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#40c057",
                borderRadius: 4
              }}
            />
            <Text size="xs">Nhân viên</Text>
          </Group>
          <Group gap="xs">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#868e96",
                borderRadius: 4
              }}
            />
            <Text size="xs">Chưa có quan hệ</Text>
          </Group>
        </Group>
      </Paper>

      {/* React Flow Graph */}
      <Paper withBorder style={{ height: 600 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 3, stroke: "#228be6" }
          }}
          minZoom={0.1}
          maxZoom={4}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as any
              return data.employeeCount > 0 && data.managerCount === 0
                ? "#fa5252"
                : data.employeeCount > 0 && data.managerCount > 0
                  ? "#228be6"
                  : data.employeeCount === 0 && data.managerCount > 0
                    ? "#40c057"
                    : "#868e96"
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            nodeStrokeWidth={3}
          />
        </ReactFlow>
      </Paper>

      <Text size="xs" c="dimmed" ta="center">
        💡 Tip: Kéo để di chuyển, cuộn để zoom, kéo node để sắp xếp lại
      </Text>
    </Stack>
  )
}
