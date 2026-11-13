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
  const dialogRef = useRef<HTMLElement>(null);
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

  // Esc menutup, scroll body dikunci
  useEffect(() => {
    if (!open) return;
    const opener = openRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsInside = dialogRef.current?.contains(document.activeElement);
      if (event.shiftKey && (!focusIsInside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (!focusIsInside || document.activeElement === last)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
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
      {/* Header melayang mobile */}
      <div className="mnav-fade sticky top-0 z-30 bg-[#F5F1F2]/90 backdrop-blur-xs px-3 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] md:hidden">
        <header className="flex items-center gap-3 rounded-2xl border border-[#E8E2E4] bg-white p-2.5 pr-3 shadow-xs">
          <button
            ref={openRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5E6E9] text-mulberry-800 transition hover:bg-[#EDCFD6]"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-mulberry-700">
              Portal {roleLabel}
            </p>
            <p className="truncate font-display text-base font-bold leading-tight text-[#1C1917]">
              {title}
            </p>
          </div>

          <ThemeToggle />
        </header>
      </div>

      {/* Drawer menu mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="sheet-backdrop absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="drawer-panel absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-[#E8E2E4] bg-[#FAF7F8] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-[#272125] shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-[#E8E2E4] px-5 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mulberry-700 font-display text-sm font-bold text-white shadow-xs">
                CN
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight text-[#1C1917]">
                  SMK Citra Negara
                </p>
                <p className="truncate text-xs text-[#796E72]">
                  Portal Pembelajaran
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5E6E9] text-mulberry-800 transition hover:bg-[#EDCFD6]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 px-5 pb-1 pt-4">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-mulberry-700 font-mono text-[11px] font-bold text-white shadow-xs"
              >
                {initials}
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-mulberry-800">
                {roleLabel}
              </p>
            </div>

            <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "border border-[#FECDD3] bg-white text-mulberry-800 shadow-xs"
                        : "text-[#57534E] active:bg-[#F5E6E9]"
                    }`}
                  >
                    {Icon && <Icon size={18} className={active ? "text-mulberry-700" : "text-[#796E72]"} aria-hidden="true" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-2 pt-2 border-t border-[#E8E2E4]">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: LOGOUT_HREF })}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#796E72] transition hover:bg-[#FCE7EB] hover:text-mulberry-800"
              >
                <LogOut size={18} aria-hidden="true" />
                Keluar
              </button>
            </div>

            <div className="border-t border-[#E8E2E4] px-5 py-3 text-[11px] text-[#A8A29E]">
              SMK Citra Negara · 2026
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
