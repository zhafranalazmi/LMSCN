"use client";

import { Download, FileSpreadsheet, LayoutDashboard, UserRound } from "lucide-react";
import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/dashboard/kepsek", icon: LayoutDashboard },
  { label: "Unduh Data", href: "/dashboard/kepsek/unduh-data", short: "Unduh", icon: Download },
  { label: "Rekap Nilai", href: "/dashboard/kepsek/nilai", short: "Nilai", icon: FileSpreadsheet },
  { label: "Profil", href: "/dashboard/kepsek/profil", icon: UserRound },
  { label: "Log Out", href: "/login" },
];

export default function KepsekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={NAV_ITEMS} roleLabel="Kepala Sekolah" initials="KS">
      {children}
    </DashboardShell>
  );
}