"use client";

import { BookOpen, GraduationCap, LayoutDashboard, School, ShieldCheck, Users } from "lucide-react";
import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Manajemen Kelas", href: "/dashboard/admin/kelas", short: "Kelas", icon: School },
  { label: "Manajemen Siswa", href: "/dashboard/admin/siswa", short: "Siswa", icon: Users },
  { label: "Manajemen Guru", href: "/dashboard/admin/guru", icon: GraduationCap },
  { label: "Mata Pelajaran", href: "/dashboard/admin/mapel", icon: BookOpen },
  { label: "Akun Pengelola", href: "/dashboard/admin/akun", icon: ShieldCheck },
  { label: "Logout", href: "/login" },

];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={NAV_ITEMS} roleLabel="Admin" initials="AD">
      {children}
    </DashboardShell>
  );
}