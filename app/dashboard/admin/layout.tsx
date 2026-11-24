import { BookOpen, GraduationCap, LayoutDashboard, School, ShieldCheck, UserRound, Users } from "lucide-react";
import DashboardShell from "@/components/shared/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Manajemen Kelas", href: "/dashboard/admin/kelas", short: "Kelas", icon: School },
  { label: "Manajemen Siswa", href: "/dashboard/admin/siswa", short: "Siswa", icon: Users },
  { label: "Manajemen Guru", href: "/dashboard/admin/guru", icon: GraduationCap },
  { label: "Mata Pelajaran", href: "/dashboard/admin/mapel", icon: BookOpen },
  { label: "Akun Pengelola", href: "/dashboard/admin/akun", icon: ShieldCheck },
  { label: "Profil", href: "/dashboard/admin/profil", icon: UserRound },
  { label: "Logout", href: "/login" },

];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const roleLabel = (session?.user as any)?.role === "superadmin" ? "Super Admin" : "Admin";
  const initials = roleLabel === "Super Admin" ? "SA" : "AD";
  const items = roleLabel === "Super Admin"
    ? [
        ...NAV_ITEMS,
        { label: "Dashboard Guru", href: "/dashboard/guru", icon: GraduationCap },
        { label: "Dashboard Siswa", href: "/dashboard/siswa", icon: Users },
        { label: "Dashboard Kepsek", href: "/dashboard/kepsek", icon: School },
        { label: "Dashboard Kurikulum", href: "/dashboard/kurikulum", icon: BookOpen },
      ]
    : NAV_ITEMS;

  return (
    <DashboardShell items={items} roleLabel={roleLabel} initials={initials}>
      {children}
    </DashboardShell>
  );
}