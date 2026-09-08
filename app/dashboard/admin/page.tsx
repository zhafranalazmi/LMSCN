"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Admin", value: stats?.admin, icon: "🛡️" },
    { label: "Guru", value: stats?.guru, icon: "👩‍🏫" },
    { label: "Siswa", value: stats?.siswa, icon: "🎓" },
    { label: "Kepsek", value: stats?.kepsek, icon: "🏫" },
    { label: "Kurikulum", value: stats?.kurikulum, icon: "📘" },
  ];

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            RINGKASAN SISTEM
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Admin
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Ringkasan akun yang sudah terdaftar di sistem LMS SMK Citra Negara.
          </p>
        </div>
      </section>

      {/* Total Akun — highlight card */}
      <section className="mb-6 overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col items-start gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">
              Total Akun Terdaftar
            </p>
            <p className="mt-1 font-display text-4xl font-bold text-[#1d3345]">
              {loading ? "…" : stats?.total ?? 0}
            </p>
          </div>
          <span className="rounded-full bg-[#4b7899]/10 px-4 py-2 text-xs font-bold text-[#3d6687]">
            Semua role
          </span>
        </div>
      </section>

      {/* Breakdown per role */}
      <section className="rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#1d3345]">Akun per Role</h2>
          <p className="text-sm text-[#1d3345]/55">
            Rincian jumlah akun terdaftar untuk setiap role di sistem.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] px-5 py-4 transition hover:border-[#4b7899]/30 hover:bg-[#4b7899]/[0.04]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4b7899]/10 text-lg">
                {card.icon}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d3345]/50">
                  {card.label}
                </p>
                <p className="font-display text-2xl font-bold text-[#1d3345]">
                  {loading ? "…" : card.value ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}