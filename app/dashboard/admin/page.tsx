"use client";

import GreetingLine from "@/components/shared/GreetingLine";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, School, Shield, Users } from "lucide-react";

type Stats = {
  admin: number;
  guru: number;
  siswa: number;
  kepsek: number;
  kurikulum: number;
  total: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Gagal mengambil statistik");
        }
        const data: Stats = await response.json();
        if (active) {
          setStats(data);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, [attempt]);

  const cards = [
    { label: "Admin", value: stats?.admin, icon: Shield },
    { label: "Guru", value: stats?.guru, icon: Users },
    { label: "Siswa", value: stats?.siswa, icon: GraduationCap },
    { label: "Kepsek", value: stats?.kepsek, icon: School },
    { label: "Kurikulum", value: stats?.kurikulum, icon: BookOpen },
  ];

  return (
    <main className="min-h-full space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-[#E8E2E4] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#FECDD3] bg-[#FFE4E6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mulberry-800">
                RINGKASAN SISTEM
              </span>
              <GreetingLine />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Pusat Data Pokok Admin
            </h1>
            <p className="text-xs text-[#796E72] sm:text-sm">
              Rekapitulasi akun terdaftar di sistem LMS SMK Citra Negara.
            </p>
          </div>
        </div>
      </section>

      {/* Total Akun Highlight Card */}
      <section className="rounded-2xl border border-[#E8E2E4] bg-white p-6 shadow-xs">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#796E72]">
              Total Akun Terdaftar
            </p>
            <p
              aria-live="polite"
              aria-busy={loading}
              className="mt-1 font-display text-4xl font-bold text-[#1C1917]"
            >
              {loading ? "Memuat..." : error ? "Tidak tersedia" : stats?.total ?? 0}
            </p>
          </div>
          <span className="rounded-full border border-[#FECDD3] bg-[#FFE4E6] px-3.5 py-1 text-xs font-bold text-mulberry-800">
            Semua Peran Aktif
          </span>
        </div>
      </section>

      {/* Breakdown per role */}
      {error ? (
        <section
          role="alert"
          className="rounded-2xl border border-rose-200 bg-white p-5 text-xs text-rose-800 shadow-xs sm:p-6"
        >
          <p>Statistik gagal dimuat. Periksa koneksi lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-3 rounded-lg bg-mulberry-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-mulberry-800"
          >
            Coba lagi
          </button>
        </section>
      ) : !loading && stats?.total === 0 ? (
        <section
          role="status"
          className="rounded-2xl border border-[#E8E2E4] bg-white p-5 text-xs text-[#796E72] shadow-xs sm:p-6"
        >
          Belum ada akun terdaftar. Tambahkan akun melalui menu pengelolaan untuk
          melihat ringkasan di sini.
        </section>
      ) : (
        <section
          aria-busy={loading}
          className="rounded-2xl border border-[#E8E2E4] bg-white p-5 shadow-xs sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-base font-bold text-[#1C1917]">Distribusi Pengguna per Peran</h2>
            <p className="text-xs text-[#796E72]">
              Rincian jumlah pengguna aktif untuk setiap hak akses sistem.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="flex items-center gap-4 rounded-xl border border-[#E8E2E4] bg-[#FAF7F8] px-5 py-4 transition hover:border-[#FECDD3] hover:bg-white"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE7EB] text-mulberry-700">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#796E72]">
                      {card.label}
                    </p>
                    <p className="font-display text-2xl font-bold font-mono text-[#1C1917]">
                      {loading ? "..." : card.value ?? 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
