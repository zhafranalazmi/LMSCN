"use client";

import { BookOpen, ClipboardCheck, ClipboardList, LayoutDashboard } from "lucide-react";
import DashboardShell from "@/components/shared/DashboardShell";
const NAV_ITEMS = [
  { label: "Ringkasan", href: "/dashboard/siswa", icon: LayoutDashboard },
  { label: "Tugas", href: "/dashboard/siswa/tugas", icon: ClipboardList },
  { label: "Materi", href: "/dashboard/siswa/materi", short: "Materi", icon: BookOpen },
  { label: "Asesmen", href: "/dashboard/siswa/asesmen", icon: ClipboardCheck },
  { label: "Log Out", href: "/login" },
];

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={NAV_ITEMS} roleLabel="Siswa" initials="SW">
      {children}
    </DashboardShell>
  );
}