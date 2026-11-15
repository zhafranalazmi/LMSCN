"use client";

import { useEffect, useState } from "react";
import GreetingLine from "@/components/shared/GreetingLine";
import Link from "next/link";
import { BookOpen, ChevronRight, ClipboardList, Clock, FileCheck2 } from "lucide-react";

interface TugasItem {
  _id: string;
  judul: string;
  deskripsi: string;
  mapel: string;
  deadline: string;
  sudahKumpul: boolean;
}

interface AsesmenItem {
  _id: string;
  sudahDikerjakan: boolean;
}

export default function SiswaDashboard() {
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [materiCount, setMateriCount] = useState<number | null>(null);
  const [asesmenList, setAsesmenList] = useState<AsesmenItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadDashboardData() {
      try {
        const [tugasRes, materiRes, asesmenRes] = await Promise.allSettled([
          fetch("/api/siswa/tugas").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/siswa/materi").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/siswa/asesmen").then((r) => (r.ok ? r.json() : [])),
        ]);

        if (!alive) return;

        if (tugasRes.status === "fulfilled" && Array.isArray(tugasRes.value)) {
          setTugasList(tugasRes.value);
        }
        if (materiRes.status === "fulfilled" && Array.isArray(materiRes.value)) {
          setMateriCount(materiRes.value.length);
        }
        if (asesmenRes.status === "fulfilled" && Array.isArray(asesmenRes.value)) {
          setAsesmenList(asesmenRes.value);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadDashboardData();

    return () => {
      alive = false;
    };
  }, []);

  // Filter tugas yang belum dikumpulkan dan urutkan berdasarkan deadline terdekat
  const pendingTasks = tugasList
    .filter((t) => !t.sudahKumpul)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Tugas mendesak (paling dekat tenggatnya)
  const urgentTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  // Asesmen yang belum dikerjakan
  const pendingAsesmen = asesmenList.filter((a) => !a.sudahDikerjakan);

  function formatDeadline(deadlineStr: string) {
    try {
      const date = new Date(deadlineStr);
      if (isNaN(date.getTime())) return deadlineStr;
      return (
        date.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return deadlineStr;
    }
  }

  const menu = [
    {
      title: "Tugas",
      desc: "Lihat rincian tugas dan kumpulkan jawaban",
      icon: ClipboardList,
      href: "/dashboard/siswa/tugas",
      tag: loading
        ? "Memuat..."
        : pendingTasks.length > 0
        ? `${pendingTasks.length} Belum Kumpul`
        : tugasList.length > 0
        ? "Semua Selesai"
        : "Belum Ada Tugas",
    },
    {
      title: "Materi",
      desc: "Unduh modul dokumen PDF dan video pelajaran",
      icon: BookOpen,
      href: "/dashboard/siswa/materi",
      tag: loading
        ? "Memuat..."
        : materiCount !== null
        ? `${materiCount} Modul`
        : "Bank Modul",
    },
    {
      title: "Asesmen CBT",
      desc: "Kerjakan kuis harian dan ujian daring terjadwal",
      icon: FileCheck2,
      href: "/dashboard/siswa/asesmen",
      tag: loading
        ? "Memuat..."
        : pendingAsesmen.length > 0
        ? `${pendingAsesmen.length} Siap Ujian`
        : asesmenList.length > 0
        ? "Semua Selesai"
        : "Belum Ada Ujian",
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
                PORTAL SISWA
              </span>
              <GreetingLine />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Ringkasan Belajar Siswa
            </h1>
            <p className="text-xs text-[#796E72] sm:text-sm">
              Pantau tenggat tugas, unduh materi kejuruan, dan ikuti ujian daring terjadwal.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/dashboard/siswa/tugas"
              className="inline-flex items-center gap-2 rounded-xl bg-mulberry-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-mulberry-800"
            >
              <span>Periksa Tugas</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Spotlight Tugas Terdekat: HANYA tampil jika benar-benar ada tugas yang belum dikerjakan dari guru */}
      {!loading && urgentTask && (
        <section className="rounded-2xl border border-[#FECDD3] bg-[#FFF5F7] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded font-mono text-[10px] font-bold uppercase text-white bg-mulberry-700 px-2 py-0.5">
                  <Clock size={12} />
                  Tenggat Terdekat
                </span>
                <span className="text-xs font-semibold text-mulberry-800">
                  {urgentTask.mapel}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1C1917]">
                {urgentTask.judul}
              </h2>
              <p className="text-xs text-[#57534E]">
                Batas pengumpulan: <strong>{formatDeadline(urgentTask.deadline)}</strong>
              </p>
            </div>

            <Link
              href="/dashboard/siswa/tugas"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-mulberry-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-mulberry-800 shadow-xs"
            >
              Kumpulkan Jawaban
            </Link>
          </div>
        </section>
      )}

      {/* Main Feature Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
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
                  <span>Buka Halaman</span>
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
