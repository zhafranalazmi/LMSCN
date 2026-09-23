"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface AsesmenItem {
  _id: string;
  judul: string;
  deskripsi: string;
  mapel: string;
  durasiMenit: number;
  jumlahSoal: number;
  sudahDikerjakan: boolean;
  nilaiTotal: number | null;
  status: "menunggu_penilaian" | "selesai" | null;
}

export default function AsesmenSiswaPage() {
  const [asesmenList, setAsesmenList] = useState<AsesmenItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/siswa/asesmen")
      .then((res) => res.json())
      .then((data) => setAsesmenList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL SISWA
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Asesmen
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Kuis dan ujian online untuk kelas kamu.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
              <p className="text-sm text-[#1d3345]/50">Memuat asesmen...</p>
            </div>
          )}

          {!loading && asesmenList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#1d3345]/50">Belum ada asesmen.</p>
            </div>
          )}

          <div className="space-y-3">
            {asesmenList.map((a) => (
              <div
                key={a._id}
                className="flex flex-col gap-3 rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#1d3345]">{a.judul}</h3>
                    <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                      {a.mapel}
                    </span>
                    {a.sudahDikerjakan && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          a.status === "selesai"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {a.status === "selesai" ? `Nilai: ${a.nilaiTotal}` : "Menunggu Penilaian"}
                      </span>
                    )}
                  </div>
                  {a.deskripsi && (
                    <p className="mb-1 text-sm text-[#1d3345]/60">{a.deskripsi}</p>
                  )}
                  <p className="text-xs text-[#1d3345]/50">
                    {a.jumlahSoal} soal · {a.durasiMenit} menit
                  </p>
                </div>

                {a.sudahDikerjakan ? (
                  <span className="rounded-lg border border-[#3d6687]/10 px-3 py-2 text-xs font-bold text-[#1d3345]/40">
                    Sudah Dikerjakan
                  </span>
                ) : (
                  <Link
                    href={`/dashboard/siswa/asesmen/${a._id}`}
                    className="rounded-lg bg-[#3d6687] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2f5573]"
                  >
                    Kerjakan
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}