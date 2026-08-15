"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard/admin" },
  { label: "Manajemen Kelas", href: "/dashboard/admin/kelas" },
  { label: "Manajemen Siswa", href: "/dashboard/admin/siswa" },
  { label: "Guru & Wali Kelas", href: "/dashboard/admin/guru" },
  { label: "Mata Pelajaran", href: "/dashboard/admin/mapel" },
  { label: "Akun Kepsek & Kurikulum", href: "/dashboard/admin/akun" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      <aside className="w-56 shrink-0 hidden md:block">
        <nav className="bg-white rounded-xl border border-ink/10 p-3 sticky top-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard/admin"
                ? pathname === item.href
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-plum-700 text-white"
                    : "text-ink/70 hover:bg-brand-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Nav versi mobile: horizontal scroll di atas konten */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ink/10 z-40 overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard/admin"
                ? pathname === item.href
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-plum-700 text-white"
                    : "text-ink/70 bg-brand-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0 pb-16 md:pb-0">{children}</div>
    </div>
  );
}
