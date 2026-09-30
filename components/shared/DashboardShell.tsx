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
    <div className="dash min-h-screen bg-[#f5f6f6] max-md:bg-gradient-to-b max-md:from-navy-100 max-md:to-[#f5f6f6]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy-700 text-white md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-500 font-display text-sm font-bold">
            CN
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">SMK Citra Negara</p>
            <p className="text-xs text-white/55">Portal Pembelajaran</p>
          </div>
        </div>

        <p className="px-5 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wide text-white/45">
          {roleLabel}
        </p>
        <nav aria-label={`Navigasi ${roleLabel}`} className="mt-1 flex-1 space-y-1 overflow-y-auto px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-navy-500 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {Icon && <Icon size={18} aria-hidden="true" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} aria-hidden="true" />
            Keluar
          </button>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-[11px] text-white/40">
          SMK Citra Negara · 2026
        </div>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 items-center justify-end border-b border-ink/10 bg-white px-6 md:flex">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ink/70">{roleLabel}</span>
          <ThemeToggle />
          <div
            aria-label={`Akun ${roleLabel}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-500 text-sm font-semibold text-white"
          >
            {initials}
          </div>
        </div>
      </header>

      <MobileNav items={items} roleLabel={roleLabel} initials={initials} />

      <div className="px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1 md:ml-64 md:px-6 md:pb-6 md:pt-16">
        {children}
      </div>
    </div>
  );
}