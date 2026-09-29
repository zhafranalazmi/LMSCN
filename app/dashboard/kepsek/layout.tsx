"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSpreadsheet, GraduationCap, LayoutDashboard } from "lucide-react";
import MobileNav from "@/components/shared/MobileNav";
import ThemeToggle from "@/components/shared/ThemeToggle";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard/kepsek", icon: LayoutDashboard },
  { label: "Lihat Guru", href: "/dashboard/kepsek/guru", icon: GraduationCap },
  { label: "Download Nilai", href: "/dashboard/kepsek/nilai", short: "Nilai", icon: FileSpreadsheet },
  { label: "Log Out", href: "/login" },
];

export default function KepsekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard/kepsek" ? pathname === href : pathname?.startsWith(href);

  return (
    <div className="dash min-h-screen bg-white max-md:bg-gradient-to-b max-md:from-navy-100 max-md:to-[#f5f6f6]">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-navy-700 text-white flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-navy-500 flex items-center justify-center font-display font-bold text-sm">
            CN
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">SMK Citra Negara</p>
            <p className="text-xs text-white/50">Sistem LMS Sekolah</p>
          </div>
        </div>

        <p className="px-5 pt-4 pb-1 text-[11px] font-medium text-white/40 uppercase tracking-wide">
          Kepala Sekolah
        </p>

        <nav className="flex-1 px-3 mt-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-navy-500 text-white"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 text-[11px] text-white/30 border-t border-white/10">
          © 2026 SMK Citra Negara
          <br />
          v1.0 — Portal Kepala Sekolah
        </div>
      </aside>

      <header className="hidden md:flex fixed top-0 left-64 right-0 h-16 bg-white border-b border-ink/10 items-center justify-end px-6 z-30">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-9 h-9 rounded-full bg-navy-500 text-white flex items-center justify-center text-sm font-semibold">
          KS
        </div>
        </div>
      </header>

      <MobileNav items={NAV_ITEMS} roleLabel="Kepala Sekolah" initials="KS" />

      <div className="md:ml-64 md:pt-16 px-3 pt-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">{children}</div>
    </div>
  );
}