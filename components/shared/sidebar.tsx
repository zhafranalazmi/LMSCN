"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

export type SidebarGroup = {
  label: string;
  items: { label: string; href: string; icon: React.ElementType }[];
};

export default function Sidebar({
  roleLabel,
  groups,
}: {
  roleLabel: string;
  groups: SidebarGroup[];
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-navy-900 text-white flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-white0 flex items-center justify-center font-display font-bold text-sm">
          CN
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">SMK Citra Negara</p>
          <p className="text-xs text-white/50">Sistem LMS Sekolah</p>
        </div>
      </div>

      <button className="mx-5 mt-4 flex items-center justify-between text-xs text-white/50 uppercase tracking-wide">
        {roleLabel} <ChevronDown size={14} />
      </button>

      <nav className="flex-1 px-3 mt-4 space-y-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[11px] font-medium text-white/40 uppercase tracking-wide">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-lg text-sm transition ${
                    isActive(item.href)
                      ? "bg-white0 text-white font-medium"
                      : "text-white/70 hover:bg-navy-100/5"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <button
          onClick={() => {/* signOut() */}}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-navy-100/5 transition"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>

      <div className="px-5 py-4 text-[11px] text-white/30 border-t border-white/10">
        © 2026 SMK Citra Negara
        <br />
        v1.0 — Portal {roleLabel}
      </div>
    </aside>
  );
}