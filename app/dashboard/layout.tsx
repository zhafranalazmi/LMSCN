import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SuperAdminProvider } from "@/components/shared/SuperAdminContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isSuperAdmin = false;
  try {
    const session = await getServerSession(authOptions);
    isSuperAdmin = (session?.user as { role?: string } | undefined)?.role === "superadmin";
  } catch {
    isSuperAdmin = false;
  }

  // Shell (sidebar / navigasi) ada di layout tiap role.
  return <SuperAdminProvider isSuperAdmin={isSuperAdmin}>{children}</SuperAdminProvider>;
}
