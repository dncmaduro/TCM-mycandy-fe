import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import {
  Container,
  Stack,
  Title,
  Text,
  Tabs,
  SegmentedControl,
  Paper,
  Divider,
  List,
  Anchor,
  Group
} from "@mantine/core"

export const Route = createFileRoute("/legal/")({
  component: RouteComponent
})

function RouteComponent() {
  const [lang, setLang] = useState<"vi" | "en">("vi")

  const t = translations[lang]

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Title order={1}>{t.title}</Title>
            <Text c="dimmed" size="sm">
              {t.subtitle}
            </Text>
            <Text c="dimmed" size="xs">
              {t.lastUpdated}:{" "}
              {new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit"
              }).format(new Date())}
            </Text>
          </Stack>
          <SegmentedControl
            value={lang}
            onChange={(v) => setLang(v as "vi" | "en")}
            data={[
              { label: "Tiếng Việt", value: "vi" },
              { label: "English", value: "en" }
            ]}
          />
        </Group>

        <Paper withBorder p="lg" radius="md">
          <Tabs defaultValue="tos">
            <Tabs.List>
              <Tabs.Tab value="tos">{t.termsTab}</Tabs.Tab>
              <Tabs.Tab value="privacy">{t.privacyTab}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="tos" pt="md">
              <Stack gap="md">
                <Section title={t.terms.intro.title}>
                  <Text>{t.terms.intro.body}</Text>
                </Section>

                <Section title={t.terms.eligibility.title}>
                  <List spacing="xs" withPadding>
                    {t.terms.eligibility.items.map((i, idx) => (
                      <List.Item key={idx}>{i}</List.Item>
                    ))}
                  </List>
                </Section>

                <Section title={t.terms.account.title}>
                  <Text>{t.terms.account.body}</Text>
                </Section>

                <Section title={t.terms.acceptable.title}>
                  <List spacing="xs" withPadding>
                    {t.terms.acceptable.items.map((i, idx) => (
                      <List.Item key={idx}>{i}</List.Item>
                    ))}
                  </List>
                </Section>

                <Section title={t.terms.google.title}>
                  <Text>{t.terms.google.body}</Text>
                </Section>

                <Section title={t.terms.liability.title}>
                  <Text>{t.terms.liability.body}</Text>
                </Section>

                <Section title={t.terms.changes.title}>
                  <Text>{t.terms.changes.body}</Text>
                </Section>

                <Section title={t.contact.title}>
                  <Text>{t.contact.body}</Text>
                  {t.contact.email && (
                    <Anchor href={`mailto:${t.contact.email}`}>
                      {t.contact.email}
                    </Anchor>
                  )}
                </Section>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="privacy" pt="md">
              <Stack gap="md">
                <Section title={t.privacy.intro.title}>
                  <Text>{t.privacy.intro.body}</Text>
                </Section>

                <Section title={t.privacy.collect.title}>
                  <List spacing="xs" withPadding>
                    {t.privacy.collect.items.map((i, idx) => (
                      <List.Item key={idx}>{i}</List.Item>
                    ))}
                  </List>
                </Section>

                <Section title={t.privacy.use.title}>
                  <List spacing="xs" withPadding>
                    {t.privacy.use.items.map((i, idx) => (
                      <List.Item key={idx}>{i}</List.Item>
                    ))}
                  </List>
                </Section>

                <Section title={t.privacy.share.title}>
                  <Text>{t.privacy.share.body}</Text>
                </Section>

                <Section title={t.privacy.security.title}>
                  <Text>{t.privacy.security.body}</Text>
                </Section>

                <Section title={t.privacy.retention.title}>
                  <Text>{t.privacy.retention.body}</Text>
                </Section>

                <Section title={t.privacy.rights.title}>
                  <List spacing="xs" withPadding>
                    {t.privacy.rights.items.map((i, idx) => (
                      <List.Item key={idx}>{i}</List.Item>
                    ))}
                  </List>
                </Section>

                <Section title={t.privacy.changes.title}>
                  <Text>{t.privacy.changes.body}</Text>
                </Section>

                <Section title={t.contact.title}>
                  <Text>{t.contact.body}</Text>
                  {t.contact.email && (
                    <Anchor href={`mailto:${t.contact.email}`}>
                      {t.contact.email}
                    </Anchor>
                  )}
                </Section>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  )
}

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Stack gap={6}>
      <Title order={3} size="h4">
        {title}
      </Title>
      <Divider />
      {children}
    </Stack>
  )
}

const translations = {
  vi: {
    title: "Điều khoản & Chính sách",
    subtitle:
      "Điều khoản dịch vụ (Terms of Service) và Chính sách bảo mật (Privacy Policy) cho TCM MyCandy",
    lastUpdated: "Cập nhật lần cuối",
    termsTab: "Điều khoản dịch vụ",
    privacyTab: "Chính sách bảo mật",
    terms: {
      intro: {
        title: "Giới thiệu",
        body: "Bằng việc sử dụng TCM MyCandy, bạn đồng ý tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ để hiểu quyền lợi và trách nhiệm của bạn."
      },
      eligibility: {
        title: "Điều kiện sử dụng",
        items: [
          "Bạn cam kết cung cấp thông tin chính xác khi đăng ký và sử dụng dịch vụ.",
          "Bạn chịu trách nhiệm bảo mật tài khoản và không chia sẻ quyền truy cập cho người khác.",
          "Việc sử dụng bị cấm cho các mục đích trái pháp luật hoặc xâm phạm quyền của bên thứ ba."
        ]
      },
      account: {
        title: "Tài khoản & Bảo mật",
        body: "Bạn chịu trách nhiệm với mọi hoạt động diễn ra trong tài khoản của mình. Hãy thông báo ngay cho chúng tôi khi phát hiện truy cập trái phép."
      },
      acceptable: {
        title: "Quy tắc sử dụng",
        items: [
          "Không tải lên nội dung độc hại, spam, hoặc vi phạm pháp luật.",
          "Không can thiệp, phá hoại, hoặc thử xâm nhập hệ thống.",
          "Tôn trọng quyền riêng tư và tài sản trí tuệ của người khác."
        ]
      },
      google: {
        title: "Google OAuth & Calendar",
        body: "Ứng dụng sử dụng ủy quyền Google để đăng nhập và đồng bộ lịch. Chỉ các quyền được bạn cho phép mới được sử dụng nhằm cung cấp tính năng quản lý công việc và lịch."
      },
      liability: {
        title: "Giới hạn trách nhiệm",
        body: "Dịch vụ được cung cấp “như hiện có”. Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp hoặc hậu quả phát sinh do việc sử dụng dịch vụ."
      },
      changes: {
        title: "Thay đổi điều khoản",
        body: "Chúng tôi có thể cập nhật điều khoản bất kỳ lúc nào. Thông báo sẽ được cung cấp khi có thay đổi quan trọng."
      }
    },
    privacy: {
      intro: {
        title: "Tổng quan",
        body: "Chính sách này mô tả dữ liệu chúng tôi thu thập, cách sử dụng, chia sẻ và bảo vệ dữ liệu của bạn khi dùng TCM MyCandy."
      },
      collect: {
        title: "Dữ liệu chúng tôi thu thập",
        items: [
          "Thông tin hồ sơ Google (email, tên, ảnh) khi bạn đăng nhập.",
          "Quyền truy cập Google Calendar để đồng bộ hóa sự kiện (siêu dữ liệu, không đọc nội dung nhạy cảm ngoài phạm vi được cấp).",
          "Dữ liệu sử dụng cơ bản để cải thiện hiệu năng và độ ổn định."
        ]
      },
      use: {
        title: "Cách chúng tôi sử dụng dữ liệu",
        items: [
          "Cung cấp và cải thiện các tính năng quản lý task và lịch.",
          "Đồng bộ hóa với Google Calendar theo cài đặt của bạn.",
          "Bảo mật, chống gian lận và tuân thủ yêu cầu pháp lý."
        ]
      },
      share: {
        title: "Chia sẻ dữ liệu",
        body: "Chúng tôi không bán dữ liệu của bạn. Dữ liệu có thể được chia sẻ với nhà cung cấp dịch vụ để vận hành hệ thống, tuân thủ pháp luật hoặc theo yêu cầu của bạn."
      },
      security: {
        title: "Bảo mật",
        body: "Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức hợp lý để bảo vệ dữ liệu. Tuy nhiên, không hệ thống nào an toàn tuyệt đối."
      },
      retention: {
        title: "Lưu trữ",
        body: "Dữ liệu được lưu trữ trong thời gian cần thiết để cung cấp dịch vụ hoặc theo quy định pháp luật. Bạn có thể yêu cầu xóa khi ngừng sử dụng."
      },
      rights: {
        title: "Quyền của bạn",
        items: [
          "Truy cập, cập nhật hoặc yêu cầu xóa dữ liệu cá nhân.",
          "Thu hồi quyền đã cấp cho Google trong phần cài đặt tài khoản Google của bạn.",
          "Liên hệ chúng tôi khi có câu hỏi về quyền riêng tư."
        ]
      },
      changes: {
        title: "Cập nhật chính sách",
        body: "Chính sách có thể thay đổi theo thời gian. Chúng tôi sẽ thông báo khi có thay đổi quan trọng."
      }
    },
    contact: {
      title: "Liên hệ",
      body: "Nếu có câu hỏi, vui lòng liên hệ:",
      email: "mycandyvn@gmail.com"
    }
  },
  en: {
    title: "Terms & Privacy",
    subtitle: "Terms of Service and Privacy Policy for TCM MyCandy",
    lastUpdated: "Last updated",
    termsTab: "Terms of Service",
    privacyTab: "Privacy Policy",
    terms: {
      intro: {
        title: "Introduction",
        body: "By using TCM MyCandy, you agree to the terms below. Please read carefully to understand your rights and responsibilities."
      },
      eligibility: {
        title: "Eligibility",
        items: [
          "Provide accurate information when using the service.",
          "You are responsible for safeguarding your account and access.",
          "Do not use the service for illegal purposes or to infringe third-party rights."
        ]
      },
      account: {
        title: "Account & Security",
        body: "You are responsible for all activities under your account. Notify us immediately of any unauthorized use."
      },
      acceptable: {
        title: "Acceptable Use",
        items: [
          "Do not upload harmful, spam, or unlawful content.",
          "Do not interfere with or attempt to compromise the system.",
          "Respect others’ privacy and intellectual property."
        ]
      },
      google: {
        title: "Google OAuth & Calendar",
        body: "We use Google authorization for sign-in and calendar sync. Only the permissions you grant are used to provide features."
      },
      liability: {
        title: "Limitation of Liability",
        body: "The service is provided “as is”. We are not liable for indirect or consequential damages resulting from the use of the service."
      },
      changes: {
        title: "Changes to the Terms",
        body: "We may update the terms at any time and will notify you of significant changes."
      }
    },
    privacy: {
      intro: {
        title: "Overview",
        body: "This policy explains what data we collect, how we use it, share it, and protect it when you use TCM MyCandy."
      },
      collect: {
        title: "Data We Collect",
        items: [
          "Google profile information (email, name, avatar) upon sign-in.",
          "Google Calendar access to sync events (metadata only within granted scopes).",
          "Basic usage data to improve reliability and performance."
        ]
      },
      use: {
        title: "How We Use Data",
        items: [
          "Deliver and improve task and calendar features.",
          "Sync with Google Calendar per your settings.",
          "Security, fraud prevention, and legal compliance."
        ]
      },
      share: {
        title: "Data Sharing",
        body: "We do not sell your data. We may share data with service providers to operate the system, comply with laws, or at your request."
      },
      security: {
        title: "Security",
        body: "We use reasonable technical and organizational measures to protect data. No system is 100% secure."
      },
      retention: {
        title: "Retention",
        body: "We retain data as long as needed to provide the service or as required by law. You can request deletion when you stop using the service."
      },
      rights: {
        title: "Your Rights",
        items: [
          "Access, update, or request deletion of your personal data.",
          "Revoke Google permissions from your Google Account settings.",
          "Contact us with any privacy questions."
        ]
      },
      changes: {
        title: "Policy Updates",
        body: "This policy may change over time. We will notify you of significant updates."
      }
    },
    contact: {
      title: "Contact",
      body: "If you have questions, reach us at:",
      email: "mycandyvn@gmail.com"
    }
  }
} as const

export default RouteComponent
