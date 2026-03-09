import DashboardLayout from "@/components/layout/DashboardLayout";
import NotificationWrapper from "@/components/notifications/NotificationWrapper";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationWrapper>
      <DashboardLayout>{children}</DashboardLayout>
    </NotificationWrapper>
  );
}
