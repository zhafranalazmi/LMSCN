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
  const rootHref = items.find((item) => item.label === "Ringkasan")?.href ?? items[0]?.href;
  const navigationItems = items.filter((item) => item.href !== "/login");
  const isActive = (href: string) =>
    href === rootHref ? pathname === href : pathname.startsWith(href);

  return (
    <div className="dash min-h-screen bg-[#F5F1F2] dark:bg-[#1A1417] text-[#272125] dark:text-[#F5EAEB] transition-colors duration-150">
      {/* Desktop Sidebar: Soft Stone in Light, Warm Charcoal in Dark */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#E8E2E4] dark:border-[#38272E] bg-[#FAF7F8] dark:bg-[#21191D] md:flex transition-colors duration-150">
        <div className="flex items-center gap-3 border-b border-[#E8E2E4] dark:border-[#38272E] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mulberry-700 font-display text-sm font-bold text-white shadow-xs">
            CN
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-[#1C1917] dark:text-[#FDF5F6]">SMK Citra Negara</p>
            <p className="text-xs text-[#796E72] dark:text-[#C5B6B9]">Portal Pembelajaran</p>
          </div>
        </div>

        <div className="px-5 pb-1 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FECDD3] dark:border-[#5C2B3C] bg-[#FFE4E6] dark:bg-[#3B1E28] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mulberry-800 dark:text-[#FFAEC0]">
            <span className="h-1.5 w-1.5 rounded-full bg-mulberry-700 dark:bg-rose-500" />
            {roleLabel}
          </span>
        </div>

        {/* Navigation Items (with matching elevated circular active badge mechanism) */}
        <nav aria-label={`Navigasi ${roleLabel}`} className="mt-2 flex-1 space-y-1.5 overflow-y-auto px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "border border-[#FECDD3] dark:border-[#5C2B3C] bg-white dark:bg-[#2C1E24] text-[#1C1917] dark:text-[#FDF5F6] shadow-xs translate-x-1"
                    : "text-[#57534E] dark:text-[#C5B6B9] hover:bg-[#F5E6E9]/60 dark:hover:bg-[#2C1E24]/60 hover:text-[#1C1917] dark:hover:text-[#FFF0F3]"
                }`}
              >
                {/* Elevated circular badge matching the mobile active mechanism */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                    active
                      ? "border-2 border-mulberry-700 dark:border-[#FFAEC0] bg-[#FFF5F7] dark:bg-[#3B1E28] text-mulberry-700 dark:text-[#FFAEC0] shadow-xs scale-105"
                      : "text-[#796E72] dark:text-[#A8989C] group-hover:bg-[#FCE7EB] dark:group-hover:bg-[#3B1E28] group-hover:text-mulberry-700"
                  }`}
                >
                  {Icon && <Icon size={16} aria-hidden="true" />}
                </div>

                <span
                  className={`truncate transition-colors ${
                    active
                      ? "font-bold text-mulberry-800 dark:text-[#FFAEC0]"
                      : "font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {active && (
                  <span
                    className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-mulberry-700 dark:bg-[#FFAEC0]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E8E2E4] dark:border-[#38272E] px-3 py-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#796E72] dark:text-[#C5B6B9] transition hover:bg-[#FCE7EB] dark:hover:bg-[#3B1E28] hover:text-mulberry-800 dark:hover:text-[#FFAEC0]"
          >
            <LogOut size={17} aria-hidden="true" />
            Keluar
          </button>
        </div>
        <div className="border-t border-[#E8E2E4] dark:border-[#38272E] px-5 py-3 text-[11px] text-[#A8A29E] dark:text-[#8C7C81]">
          SMK Citra Negara · 2026
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 items-center justify-between border-b border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#21191D] px-6 md:flex transition-colors duration-150">
        <div className="text-xs font-medium text-[#796E72] dark:text-[#C5B6B9]">
          Tahun Ajaran 2026/2027 • <span className="font-semibold text-[#1C1917] dark:text-[#FDF5F6]">Semester Ganjil</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#1C1917] dark:text-[#FDF5F6]">Portal {roleLabel}</span>
          <ThemeToggle />
          <div
            aria-label={`Akun ${roleLabel}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-mulberry-700 text-xs font-bold font-mono text-white shadow-xs"
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Mobile Top Header + Mobile Bottom Navigation Bar */}
      <MobileNav items={items} roleLabel={roleLabel} initials={initials} />

      {/* Content wrapper with safe bottom padding for Mobile Navigation Bar */}
      <div className="px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 md:ml-64 md:px-6 md:pb-8 md:pt-20">
        {children}
      </div>
    </div>
  );
}
