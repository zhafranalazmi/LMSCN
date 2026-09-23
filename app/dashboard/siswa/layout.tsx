"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard/siswa" },
  { label: "Tugas", href: "/dashboard/siswa/tugas" },
  { label: "Materi", href: "/dashboard/siswa/materi" },
  { label: "Asesmen", href: "/dashboard/siswa/asesmen" },
  { label: "Log Out", href: "/login" },
];

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard/siswa" ? pathname === href : pathname?.startsWith(href);

  return (
    <div className="min-h-screen bg-white">
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
          Siswa
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
          v1.0 — Portal Siswa
        </div>
      </aside>

      <header className="hidden md:flex fixed top-0 left-64 right-0 h-16 bg-white border-b border-ink/10 items-center justify-between px-6 z-30">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Cari..."
            className="w-full rounded-lg border border-ink/15 pl-9 pr-3 py-2 text-sm outline-none focus:border-navy-500"
          />
        </div>
        <div className="w-9 h-9 rounded-full bg-navy-500 text-white flex items-center justify-center text-sm font-semibold">
          SW
        </div>
      </header>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ink/10 z-40 overflow-x-auto shadow-sm">
        <div className="flex gap-1 p-2 min-w-max">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive(item.href)
                  ? "bg-navy-500 text-white"
                  : "text-ink/70 bg-navy-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="md:ml-64 md:pt-16 p-6 pb-20 md:pb-6">{children}</div>
    </div>
  );
}