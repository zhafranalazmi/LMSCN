"use client";

import { FileSpreadsheet, GraduationCap, LayoutDashboard } from "lucide-react";
import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/dashboard/kurikulum", icon: LayoutDashboard },
  { label: "Data Guru", href: "/dashboard/kurikulum/guru", icon: GraduationCap },
  { label: "Rekap Nilai", href: "/dashboard/kurikulum/nilai", short: "Nilai", icon: FileSpreadsheet },
    { label: "Log Out", href: "/login" },
];

export default function kurikulumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell items={NAV_ITEMS} roleLabel="Kurikulum" initials="KM">
      {children}
    </DashboardShell>
  );
}