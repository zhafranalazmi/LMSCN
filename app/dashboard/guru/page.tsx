import GreetingLine from "@/components/shared/GreetingLine";
import Link from "next/link";
import { BookOpen, ChevronRight, ClipboardCheck, ClipboardList, FileSpreadsheet, School } from "lucide-react";

export default function GuruDashboard() {
  const menu = [
    {
      title: "Kelas Saya",
      desc: "Lihat daftar siswa per rombel yang diampu",
      icon: School,
      href: "/dashboard/guru/kelas",
      tag: "4 Rombel",
    },
    {
      title: "Tugas",
      desc: "Buat tugas baru dan periksa pengumpulan siswa",
      icon: ClipboardList,
      href: "/dashboard/guru/tugas",
      tag: "14 Perlu Nilai",
    },
    {
      title: "Materi",
      desc: "Unggah dokumen PDF, presentasi, dan materi ajar",
      icon: BookOpen,
      href: "/dashboard/guru/materi",
      tag: "Bank Modul",
    },
    {
      title: "Asesmen",
      desc: "Buat kuis CBT daring dan evaluasi hasilnya",
      icon: ClipboardCheck,
      href: "/dashboard/guru/asesmen",
      tag: "CBT Online",
    },
    {
      title: "Rekap Nilai",
      desc: "Tinjau akumulasi nilai dan unduh laporan Excel",
      icon: FileSpreadsheet,
      href: "/dashboard/guru/nilai",
      tag: "Ekspor Nilai",
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
                PORTAL GURU
              </span>
              <GreetingLine />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Ringkasan Guru Pengampu
            </h1>
            <p className="text-xs text-[#796E72] sm:text-sm">
              Kelola rombongan belajar, distribusi materi, pemeriksaan tugas, dan rekapitulasi penilaian.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/dashboard/guru/tugas"
              className="inline-flex items-center gap-2 rounded-xl bg-mulberry-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-mulberry-800"
            >
              <span>Koreksi Tugas</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feature Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <span>Kelola Menu</span>
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
