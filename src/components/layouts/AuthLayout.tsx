import { ReactNode } from "react"
import { Box, BackgroundImage, Container, Center, Paper } from "@mantine/core"
import TCMBanner from "../../assets/TCM_Banner.png"

interface AuthLayoutProps {
  children: ReactNode
  maxWidth?: number
  paperProps?: React.ComponentProps<typeof Paper>
}

/**
 * AuthLayout: nền toàn màn hình + box trung tâm. Truyền bất cứ nội dung nào vào children.
 */
export function AuthLayout({
  children,
  maxWidth = 400,
  paperProps
}: AuthLayoutProps) {
  return (
    <Box h="100vh" w="100vw" style={{ position: "relative" }}>
      <BackgroundImage
        src={TCMBanner}
        h="100%"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <Container
          size="sm"
          h="100%"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Center h="100%">
            <Paper
              shadow="xl"
              p="xl"
              radius="lg"
              w="100%"
              maw={maxWidth}
              style={{
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(255, 255, 255, 0.95)"
              }}
              {...paperProps}
            >
              {children}
            </Paper>
          </Center>
        </Container>
      </BackgroundImage>
    </Box>
  )
}
