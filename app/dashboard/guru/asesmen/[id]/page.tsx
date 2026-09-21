"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Soal {
  _id: string;
  tipe: "pg" | "esai";
  pertanyaan: string;
  poin: number;
}

interface Asesmen {
  _id: string;
  judul: string;
  soal: Soal[];
}

interface JawabanItem {
  soalId: string;
  tipe: "pg" | "esai";
  jawabanPg: number | null;
  jawabanEsai: string;
  poinDiperoleh: number;
}

interface JawabanSiswa {
  _id: string;
  siswa: { name: string; email: string };
  jawaban: JawabanItem[];
  nilaiTotal: number;
  status: "menunggu_penilaian" | "selesai";
}

export default function HasilAsesmenPage() {
  const params = useParams();
  const asesmenId = params.id as string;

  const [asesmen, setAsesmen] = useState<Asesmen | null>(null);
  const [jawabanList, setJawabanList] = useState<JawabanSiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGrading, setActiveGrading] = useState<string | null>(null);
  const [nilaiEsaiForm, setNilaiEsaiForm] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const [asesmenRes, jawabanRes] = await Promise.all([
      fetch(`/api/guru/asesmen/${asesmenId}`),
      fetch(`/api/guru/asesmen/${asesmenId}/jawaban`),
    ]);
    const asesmenData = await asesmenRes.json();
    const jawabanData = await jawabanRes.json();
    setAsesmen(asesmenData);
    setJawabanList(Array.isArray(jawabanData) ? jawabanData : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asesmenId]);

  function openGrading(j: JawabanSiswa) {
    setActiveGrading(j._id);
    const initial: Record<string, number> = {};
    j.jawaban.forEach((item) => {
      if (item.tipe === "esai") initial[item.soalId] = item.poinDiperoleh;
    });
    setNilaiEsaiForm(initial);
  }

  async function handleSimpanNilai(jawabanId: string) {
    setSaving(true);
    const penilaianEsai = Object.entries(nilaiEsaiForm).map(([soalId, poinDiperoleh]) => ({
      soalId,
      poinDiperoleh,
    }));

    await fetch(`/api/guru/asesmen/${asesmenId}/jawaban/${jawabanId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ penilaianEsai }),
    });

    setSaving(false);
    setActiveGrading(null);
    loadData();
  }

  function soalById(soalId: string) {
    return asesmen?.soal.find((s) => s._id === soalId);
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            HASIL ASESMEN
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {loading ? "Memuat..." : asesmen?.judul}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Lihat hasil pengerjaan siswa dan nilai jawaban esai.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Pengerjaan</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Jawaban Siswa</h2>
          </div>
          <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
            {jawabanList.length} Siswa
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
              <p className="text-sm text-[#1d3345]/50">Memuat data...</p>
            </div>
          )}

          {!loading && jawabanList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#1d3345]/50">
                Belum ada siswa yang mengerjakan asesmen ini.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {jawabanList.map((j) => (
              <div key={j._id} className="rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#1d3345]">{j.siswa?.name}</p>
                    <p className="text-xs text-[#1d3345]/50">{j.siswa?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        j.status === "selesai"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {j.status === "selesai" ? "Sudah Dinilai" : "Menunggu Penilaian"}
                    </span>
                    <span className="rounded-full bg-[#3d6687] px-3 py-1 text-xs font-bold text-white">
                      Nilai: {j.nilaiTotal}
                    </span>
                    <button
                      onClick={() => openGrading(j)}
                      className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                    >
                      {activeGrading === j._id ? "Tutup" : "Detail & Nilai"}
                    </button>
                  </div>
                </div>

                {activeGrading === j._id && (
                  <div className="mt-4 space-y-3 border-t border-[#3d6687]/10 pt-4">
                    {j.jawaban.map((item, idx) => {
                      const soal = soalById(item.soalId);
                      if (!soal) return null;
                      return (
                        <div key={idx} className="rounded-xl bg-white p-3">
                          <p className="mb-2 text-sm font-semibold text-[#1d3345]">
                            {soal.pertanyaan}
                          </p>
                          {item.tipe === "pg" ? (
                            <p className="text-sm text-[#1d3345]/70">
                              Jawaban: pilihan {item.jawabanPg !== null ? item.jawabanPg + 1 : "-"}{" "}
                              — poin otomatis: {item.poinDiperoleh}/{soal.poin}
                            </p>
                          ) : (
                            <div>
                              <p className="mb-2 whitespace-pre-wrap text-sm text-[#1d3345]/70">
                                {item.jawabanEsai || "(kosong)"}
                              </p>
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-[#1d3345]/60">
                                  Poin (maks {soal.poin}):
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={soal.poin}
                                  value={nilaiEsaiForm[item.soalId] ?? 0}
                                  onChange={(e) =>
                                    setNilaiEsaiForm((prev) => ({
                                      ...prev,
                                      [item.soalId]: Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 rounded-lg border border-[#3d6687]/15 px-2 py-1 text-sm outline-none focus:border-[#4b7899]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      onClick={() => handleSimpanNilai(j._id)}
                      disabled={saving}
                      className="rounded-xl bg-[#3d6687] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2f5573] disabled:opacity-60"
                    >
                      {saving ? "Menyimpan..." : "Simpan Nilai"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}