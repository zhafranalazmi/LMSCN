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

  // Tutup drawer setiap navigasi pindah
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Trap focus dan scroll lock saat drawer terbuka
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

  // Siapkan item untuk Mobile Bottom Bar (maksimal 5 tab)
  const isLargeMenu = menu.length > 5;
  const bottomBarTabs = isLargeMenu
    ? [
        ...menu.slice(0, 4),
        {
          label: "Menu",
          short: "Menu",
          href: "#menu",
          icon: Menu,
          isMenuTrigger: true,
        },
      ]
    : menu;

  const isMenuTriggerActive =
    isLargeMenu && menu.slice(4).some((item) => isActive(item.href));

  return (
    <>
      {/* Header atas mobile (Ringkas, rapi, dan tidak memakan banyak tempat) */}
      <div className="mnav-fade sticky top-0 z-30 bg-[#F5F1F2]/90 dark:bg-[#1A1417]/90 backdrop-blur-xs px-3 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] md:hidden transition-colors">
        <header className="flex items-center justify-between rounded-2xl border border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#21191D] px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mulberry-700 font-display text-xs font-bold text-white shadow-xs">
              CN
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#1C1917] dark:text-[#FDF5F6]">
                SMK Citra Negara
              </p>
              <p className="truncate text-[10px] text-[#796E72] dark:text-[#C5B6B9]">
                Portal {roleLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              ref={openRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Buka menu lengkap"
              aria-haspopup="dialog"
              aria-expanded={open}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5E6E9] dark:bg-[#3B1E28] text-mulberry-800 dark:text-[#FFAEC0] transition hover:bg-[#EDCFD6]"
            >
              <Menu size={16} aria-hidden="true" />
            </button>
          </div>
        </header>
      </div>

      {/* ====================================================================
          MOBILE NAVIGATION BAR (Fixed at bottom with curved pop-up active notch)
          - Label semua tab sejajar rata di baseline horizontal yang sama
          - Tab aktif mengangkat ikon dalam lingkaran timbul Mulberry
          - Bebas bug layout di semua ukuran layar mobile
          ==================================================================== */}
      <nav
        aria-label="Navigasi bawah mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#21191D] pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_24px_rgba(39,33,37,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] transition-colors duration-150"
      >
        <div className="relative flex h-16 w-full max-w-md items-center justify-around mx-auto px-1">
          {bottomBarTabs.map((tab) => {
            const Icon = tab.icon;
            const isTrigger = "isMenuTrigger" in tab && tab.isMenuTrigger;
            const active = isTrigger ? isMenuTriggerActive || open : isActive(tab.href);
            const displayLabel = tab.short ?? tab.label;

            const tabContent = (
              <div className="relative flex h-full w-full flex-col items-center justify-end pb-2">
                {active ? (
                  <>
                    {/* Lekukan kurva lembut di belakang lingkaran aktif */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-4 pointer-events-none overflow-visible">
                      <svg
                        viewBox="0 0 64 16"
                        className="w-full h-full fill-white dark:fill-[#21191D]"
                        preserveAspectRatio="none"
                      >
                        <path d="M 0 16 C 12 16 16 0 32 0 C 48 0 52 16 64 16 Z" />
                      </svg>
                    </div>

                    {/* Gelembung Lingkaran Timbul Aktif (Floating Circular Bubble) */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-mulberry-700 dark:border-[#FFAEC0] bg-[#FFF5F7] dark:bg-[#2C1E24] text-mulberry-700 dark:text-[#FFAEC0] shadow-md transition-all duration-200">
                      {Icon && <Icon size={20} aria-hidden="true" />}
                    </div>

                    {/* Label Aktif (Tebal & Berwarna Mulberry, baseline sejajar rata) */}
                    <span className="text-[10px] font-bold text-mulberry-800 dark:text-[#FFAEC0] tracking-tight truncate max-w-[60px] leading-tight">
                      {displayLabel}
                    </span>
                  </>
                ) : (
                  <>
                    {/* Ikon Tab Tidak Aktif */}
                    <div className="mb-1 flex h-6 w-6 items-center justify-center text-[#796E72] dark:text-[#A8989C] transition-colors">
                      {Icon && <Icon size={19} aria-hidden="true" />}
                    </div>

                    {/* Label Tab Tidak Aktif (Baseline sejajar rata dengan tab aktif) */}
                    <span className="text-[10px] font-medium text-[#796E72] dark:text-[#A8989C] tracking-tight truncate max-w-[60px] leading-tight">
                      {displayLabel}
                    </span>
                  </>
                )}
              </div>
            );

            if (isTrigger) {
              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label="Buka menu lengkap"
                  className="relative flex flex-1 h-full items-center justify-center select-none"
                >
                  {tabContent}
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-1 h-full items-center justify-center select-none"
              >
                {tabContent}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Drawer menu mobile (untuk menu lengkap & keluar) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="sheet-backdrop absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi lengkap"
            className="drawer-panel absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-[#E8E2E4] dark:border-[#38272E] bg-[#FAF7F8] dark:bg-[#21191D] pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-[#272125] dark:text-[#F5EAEB] shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-[#E8E2E4] dark:border-[#38272E] px-5 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mulberry-700 font-display text-sm font-bold text-white shadow-xs">
                CN
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight text-[#1C1917] dark:text-[#FDF5F6]">
                  SMK Citra Negara
                </p>
                <p className="truncate text-xs text-[#796E72] dark:text-[#C5B6B9]">
                  Portal Pembelajaran
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5E6E9] dark:bg-[#3B1E28] text-mulberry-800 dark:text-[#FFAEC0] transition hover:bg-[#EDCFD6]"
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
              <p className="text-xs font-bold uppercase tracking-wider text-mulberry-800 dark:text-[#FFAEC0]">
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
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "border border-[#FECDD3] dark:border-[#5C2B3C] bg-white dark:bg-[#2C1E24] text-mulberry-800 dark:text-[#FFAEC0] shadow-xs"
                        : "text-[#57534E] dark:text-[#C5B6B9] active:bg-[#F5E6E9] dark:active:bg-[#3B1E28]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                        active
                          ? "border-2 border-mulberry-700 dark:border-[#FFAEC0] bg-[#FFF5F7] dark:bg-[#3B1E28] text-mulberry-700 dark:text-[#FFAEC0]"
                          : "text-[#796E72] dark:text-[#A8989C]"
                      }`}
                    >
                      {Icon && <Icon size={16} aria-hidden="true" />}
                    </div>
                    <span className={active ? "font-bold text-mulberry-800 dark:text-[#FFAEC0]" : "font-medium"}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-2 pt-2 border-t border-[#E8E2E4] dark:border-[#38272E]">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: LOGOUT_HREF })}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#796E72] dark:text-[#C5B6B9] transition hover:bg-[#FCE7EB] dark:hover:bg-[#3B1E28] hover:text-mulberry-800 dark:hover:text-[#FFAEC0]"
              >
                <LogOut size={18} aria-hidden="true" />
                Keluar
              </button>
            </div>

            <div className="border-t border-[#E8E2E4] dark:border-[#38272E] px-5 py-3 text-[11px] text-[#A8A29E] dark:text-[#8C7C81]">
              SMK Citra Negara · 2026
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
