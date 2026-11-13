import GreetingLine from "@/components/shared/GreetingLine";
import Link from "next/link";
import { ChevronRight, Download, FileSpreadsheet } from "lucide-react";

export default function KurikulumDashboard() {
  const menu = [
    {
      title: "Rekap Nilai",
      desc: "Tinjau distribusi nilai akademik per rombel kelas atau keseluruhan",
      icon: FileSpreadsheet,
      href: "/dashboard/kurikulum/nilai",
      tag: "Analisis Nilai",
    },
    {
      title: "Unduh Data",
      desc: "Unduh data rekapitulasi siswa dan guru ke format lembar kerja",
      icon: Download,
      href: "/dashboard/kurikulum/unduh-data",
      tag: "Ekspor Data",
    },
  ];

  return (
    <main className="min-h-full space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-[#E8E2E4] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#FECDD3] bg-[#FFE4E6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mulberry-800">
                PORTAL KURIKULUM
              </span>
              <GreetingLine />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Ringkasan Capaian Kurikulum
            </h1>
            <p className="text-xs text-[#796E72] sm:text-sm">
              Analisis capaian kompetensi dasar dan rekapitulasi penilaian hasil belajar siswa.
            </p>
          </div>
        </div>
      </section>

      {/* Main Feature Cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="group block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[#E8E2E4] bg-white p-5 shadow-xs transition hover:border-mulberry-300 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCE7EB] text-mulberry-700 transition group-hover:bg-mulberry-700 group-hover:text-white">
                      <Icon size={20} />
                    </span>
                    <span className="font-mono text-[10px] font-bold text-mulberry-800 bg-[#FFE4E6] px-2 py-0.5 rounded-full border border-[#FECDD3]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#1C1917] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#796E72] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F5F1F2] flex items-center justify-between text-xs font-semibold text-mulberry-700 group-hover:text-mulberry-800">
                  <span>Buka Menu</span>
                  <ChevronRight size={14} className="transition transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
