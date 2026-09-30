"use client";

import { BookOpen, ClipboardCheck, ClipboardList, FileSpreadsheet, LayoutDashboard, School } from "lucide-react";
import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/dashboard/guru", icon: LayoutDashboard },
  { label: "Kelas Saya", href: "/dashboard/guru/kelas", icon: School },
  { label: "Tugas", href: "/dashboard/guru/tugas", icon: ClipboardList },
  { label: "Materi", href: "/dashboard/guru/materi", short: "Materi", icon: BookOpen },
  { label: "Asesmen", href: "/dashboard/guru/asesmen", icon: ClipboardCheck },
  { label: "Rekap Nilai", href: "/dashboard/guru/nilai", icon: FileSpreadsheet },
  { label: "Log Out", href: "/login" },
];
export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={NAV_ITEMS} roleLabel="Guru" initials="GR">
      {children}
    </DashboardShell>
  );
}