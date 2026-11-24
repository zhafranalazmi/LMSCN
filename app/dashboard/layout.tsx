import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SuperAdminProvider } from "@/components/shared/SuperAdminContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = (session?.user as { role?: string } | undefined)?.role === "superadmin";

  // Shell (sidebar / navigasi) ada di layout tiap role.
  return <SuperAdminProvider isSuperAdmin={isSuperAdmin}>{children}</SuperAdminProvider>;
}
