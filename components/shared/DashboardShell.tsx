"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import MobileNav, { type MobileNavItem } from "@/components/shared/MobileNav";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function DashboardShell({
  children,
  items,
  roleLabel,
  initials,
}: {
  children: ReactNode;
  items: MobileNavItem[];
  roleLabel: string;
  initials: string;
}) {
  const pathname = usePathname() ?? "";
  const rootHref = items.find((item) => item.label === "Ringkasan")?.href;
  const navigationItems = items.filter((item) => item.href !== "/login");
  const isActive = (href: string) =>
    href === rootHref ? pathname === href : pathname.startsWith(href);

  return (
    <div className="dash min-h-screen bg-[#F5F1F2] text-[#272125]">
      {/* Desktop Sidebar: Soft Stone with Mulberry Wine Accent */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#E8E2E4] bg-[#FAF7F8] md:flex">
        <div className="flex items-center gap-3 border-b border-[#E8E2E4] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mulberry-700 font-display text-sm font-bold text-white shadow-xs">
            CN
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-[#1C1917]">SMK Citra Negara</p>
            <p className="text-xs text-[#796E72]">Portal Pembelajaran</p>
          </div>
        </div>

        <div className="px-5 pb-1 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FECDD3] bg-[#FFE4E6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mulberry-800">
            <span className="h-1.5 w-1.5 rounded-full bg-mulberry-700" />
            {roleLabel}
          </span>
        </div>

        <nav aria-label={`Navigasi ${roleLabel}`} className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border border-[#FECDD3] bg-white text-mulberry-800 shadow-xs"
                    : "text-[#57534E] hover:bg-[#F5E6E9] hover:text-[#1C1917]"
                }`}
              >
                {Icon && <Icon size={17} className={active ? "text-mulberry-700" : "text-[#796E72]"} aria-hidden="true" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E8E2E4] px-3 py-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#796E72] transition hover:bg-[#FCE7EB] hover:text-mulberry-800"
          >
            <LogOut size={17} aria-hidden="true" />
            Keluar
          </button>
        </div>
        <div className="border-t border-[#E8E2E4] px-5 py-3 text-[11px] text-[#A8A29E]">
          SMK Citra Negara · 2026
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 items-center justify-between border-b border-[#E8E2E4] bg-white px-6 md:flex">
        <div className="text-xs font-medium text-[#796E72]">
          Tahun Ajaran 2026/2027 • <span className="font-semibold text-[#1C1917]">Semester Ganjil</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#1C1917]">Portal {roleLabel}</span>
          <ThemeToggle />
          <div
            aria-label={`Akun ${roleLabel}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-mulberry-700 text-xs font-bold font-mono text-white shadow-xs"
          >
            {initials}
          </div>
        </div>
      </header>

      <MobileNav items={items} roleLabel={roleLabel} initials={initials} />

      <div className="px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 md:ml-64 md:px-6 md:pb-8 md:pt-20">
        {children}
      </div>
    </div>
  );
}
