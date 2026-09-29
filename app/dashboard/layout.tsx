export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shell (sidebar / navigasi) ada di layout tiap role.
  return <>{children}</>;
}
