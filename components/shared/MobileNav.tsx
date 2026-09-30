"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";

export type MobileNavItem = {
  label: string;
  href: string;
  /** Tidak dipakai lagi di mobile, dibiarkan supaya layout lama tetap kompatibel */
  short?: string;
  icon?: React.ElementType;
};

const LOGOUT_HREF = "/login";

export default function MobileNav({
  items,
  roleLabel,
  initials,
}: {
  items: MobileNavItem[];
  roleLabel: string;
  initials: string;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  const menu = items.filter((i) => i.href !== LOGOUT_HREF);
  const rootHref = menu[0]?.href;
  const isActive = (href: string) =>
    href === rootHref ? pathname === href : pathname.startsWith(href);

  const current = menu.find((i) => isActive(i.href)) ?? menu[0];
  const title =
    current?.href === rootHref ? "Ringkasan" : current?.label;

  // Tutup drawer setiap pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc menutup, scroll body dikunci, fokus pindah ke tombol tutup lalu kembali
  useEffect(() => {
    if (!open) return;
    const opener = openRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Header melayang: tombol menu, judul halaman, avatar */}
      <div className="mnav-fade sticky top-0 z-30 bg-gradient-to-b from-navy-100 via-navy-100/85 to-transparent px-3 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] md:hidden">
        <header className="flex items-center gap-3 rounded-[28px] border border-navy-700/10 bg-white p-2.5 pr-3 shadow-sm dark:border-white/10">
          <button
            ref={openRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-100/70 text-navy-700 transition-colors active:bg-navy-100 dark:bg-white/10"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
              Portal {roleLabel}
            </p>
            <p className="truncate font-display text-lg font-bold leading-tight text-ink">
              {title}
            </p>
          </div>

          <ThemeToggle />
        </header>
      </div>

      {/* Drawer menu (gaya sidebar desktop) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="sheet-backdrop absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="drawer-panel absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col rounded-r-[28px] bg-navy-700 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-500 font-display text-sm font-bold">
                CN
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">
                  SMK Citra Negara
                </p>
                <p className="truncate text-xs text-white/50">
                  Portal Pembelajaran
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 px-5 pb-1 pt-4">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-500 text-[11px] font-semibold"
              >
                {initials}
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
                {roleLabel}
              </p>
            </div>

            <nav className="mt-1 flex-1 space-y-1 overflow-y-auto px-3">
              {menu.map((item) => {
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
                        : "text-white/70 active:bg-white/5"
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-2">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: LOGOUT_HREF })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 active:bg-white/5"
              >
                <LogOut size={18} />
                Keluar
              </button>
            </div>

            <div className="border-t border-white/10 px-5 py-4 text-[11px] text-white/40">
              SMK Citra Negara · 2026
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
