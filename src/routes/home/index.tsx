import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../../components/layouts/AppLayout"
import { Title, Text, Stack, Paper, Grid } from "@mantine/core"

export const Route = createFileRoute("/home/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AppLayout>
      <Stack>
        <Title order={2}>Tổng quan</Title>
        <Text c="dimmed">
          Trang tổng quan trống để kiểm thử layout. Thêm widget sau.
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="lg" radius="md">
              Widget 1
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="lg" radius="md">
              Widget 2
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </AppLayout>
  )
}
