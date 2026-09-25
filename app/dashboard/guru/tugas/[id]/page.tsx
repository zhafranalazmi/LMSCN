"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Pengumpulan {
  _id: string;
  siswa: { name: string; email: string };
  tipeLampiran: "link" | "pdf";
  lampiranUrl: string;
  nilai: number | null;
  status: "belum_dinilai" | "sudah_dinilai";
}

export default function PengumpulanTugasPage() {
  const params = useParams();
  const tugasId = params.id as string;

  const [judulTugas, setJudulTugas] = useState("");
  const [pengumpulanList, setPengumpulanList] = useState<Pengumpulan[]>([]);
  const [loading, setLoading] = useState(true);
  const [nilaiForm, setNilaiForm] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch(`/api/guru/tugas/${tugasId}/pengumpulan`);
    const data = await res.json();
    setJudulTugas(data.tugas?.judul ?? "");
    setPengumpulanList(Array.isArray(data.pengumpulanList) ? data.pengumpulanList : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tugasId]);

  async function handleSimpanNilai(pengumpulanId: string) {
    setSaving(pengumpulanId);
    await fetch(`/api/guru/tugas/${tugasId}/pengumpulan/${pengumpulanId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nilai: nilaiForm[pengumpulanId] ?? 0 }),
    });
    setSaving(null);
    loadData();
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            HASIL PENGUMPULAN
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {loading ? "Memuat..." : judulTugas}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Lihat tugas yang dikumpulkan siswa dan beri nilai.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Pengumpulan</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Siswa yang Mengumpulkan</h2>
          </div>
          <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
            {pengumpulanList.length} Siswa
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
              <p className="text-sm text-[#1d3345]/50">Memuat data...</p>
            </div>
          )}

          {!loading && pengumpulanList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#1d3345]/50">
                Belum ada siswa yang mengumpulkan tugas ini.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {pengumpulanList.map((p) => (
              <div
                key={p._id}
                className="flex flex-col gap-3 rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-[#1d3345]">{p.siswa?.name}</p>
                  <p className="text-xs text-[#1d3345]/50">{p.siswa?.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={p.lampiranUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                  >
                    {p.tipeLampiran === "pdf" ? "Lihat PDF" : "Buka Link"}
                  </a>

                  {p.status === "sudah_dinilai" ? (
                    <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                      Nilai: {p.nilai}
                    </span>
                  ) : (
                    <>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Nilai"
                        value={nilaiForm[p._id] ?? ""}
                        onChange={(e) =>
                          setNilaiForm((prev) => ({ ...prev, [p._id]: Number(e.target.value) }))
                        }
                        className="w-20 rounded-lg border border-[#3d6687]/15 px-2 py-2 text-sm outline-none focus:border-[#4b7899]"
                      />
                      <button
                        onClick={() => handleSimpanNilai(p._id)}
                        disabled={saving === p._id}
                        className="rounded-lg bg-[#3d6687] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2f5573] disabled:opacity-60"
                      >
                        {saving === p._id ? "..." : "Simpan"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}