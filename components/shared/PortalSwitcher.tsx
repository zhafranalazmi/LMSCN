"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useSuperAdmin } from "@/components/shared/SuperAdminContext";

const PORTALS = [
  { label: "Admin", href: "/dashboard/admin" },
  { label: "Guru", href: "/dashboard/guru" },
  { label: "Siswa", href: "/dashboard/siswa" },
  { label: "Kepsek", href: "/dashboard/kepsek" },
  { label: "Kurikulum", href: "/dashboard/kurikulum" },
];

export default function PortalSwitcher({ compact = false }: { compact?: boolean }) {
  const isSuperAdmin = useSuperAdmin();
  const pathname = usePathname() ?? "";

  if (!isSuperAdmin) return null;

  return (
    <div className={compact ? "px-3 py-2" : "px-3 pb-2 pt-3"}>
      <div className="rounded-xl border border-[#E8E2E4] dark:border-[#38272E] bg-white/80 dark:bg-[#2A2024] p-2">
        <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-[#796E72] dark:text-[#C5B6B9]">
          <Shield size={11} className="text-mulberry-700 dark:text-[#FFAEC0]" aria-hidden="true" />
          <span>Super Admin • Portal</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {PORTALS.map((portal) => {
            const active = pathname.startsWith(portal.href);
            return (
              <Link
                key={portal.href}
                href={portal.href}
                className={`rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition ${
                  active
                    ? "bg-mulberry-700 text-white dark:bg-[#F5EAEB] dark:text-[#1A1417] shadow-2xs"
                    : "text-[#57534E] dark:text-[#C5B6B9] hover:bg-mulberry-50 dark:hover:bg-[#38272E] hover:text-mulberry-800"
                }`}
              >
                {portal.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
