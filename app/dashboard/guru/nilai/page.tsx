"use client";

import { useEffect, useState } from "react";

interface AsesmenRingkas {
  _id: string;
  judul: string;
}

interface NilaiItem {
  nilaiTotal: number;
  status: "menunggu_penilaian" | "selesai";
}

interface RekapSiswa {
  siswa: { name: string; email: string };
  nilai: Record<string, NilaiItem | null>;
}

export default function NilaiPage() {
  const [mapelSaya, setMapelSaya] = useState<string[]>([]);
  const [kelasSaya, setKelasSaya] = useState<string[]>([]);
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");

  const [asesmenList, setAsesmenList] = useState<AsesmenRingkas[]>([]);
  const [rekap, setRekap] = useState<RekapSiswa[]>([]);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);

  useEffect(() => {
    async function loadMe() {
      setLoadingMe(true);
      const res = await fetch("/api/guru/me");
      const data = await res.json();
      setMapelSaya(Array.isArray(data.mapel) ? data.mapel : []);
      setKelasSaya(Array.isArray(data.kelasDiampu) ? data.kelasDiampu : []);
      setLoadingMe(false);
    }
    loadMe();
  }, []);

  useEffect(() => {
    if (mapelSaya.length > 0 && !mapel) setMapel(mapelSaya[0]);
  }, [mapelSaya]);

  useEffect(() => {
    if (kelasSaya.length > 0 && !kelas) setKelas(kelasSaya[0]);
  }, [kelasSaya]);

  useEffect(() => {
    if (!mapel || !kelas) return;
    async function loadRekap() {
      setLoadingRekap(true);
      const res = await fetch(`/api/guru/nilai?mapel=${encodeURIComponent(mapel)}&kelas=${encodeURIComponent(kelas)}`);
      const data = await res.json();
      setAsesmenList(Array.isArray(data.asesmenList) ? data.asesmenList : []);
      setRekap(Array.isArray(data.rekap) ? data.rekap : []);
      setLoadingRekap(false);
    }
    loadRekap();
  }, [mapel, kelas]);

  function rataRata(row: RekapSiswa) {
    const nilaiValid = asesmenList
      .map((a) => row.nilai[a._id])
      .filter((n): n is NilaiItem => n !== null && n !== undefined);
    if (nilaiValid.length === 0) return "-";
    const total = nilaiValid.reduce((sum, n) => sum + n.nilaiTotal, 0);
    return (total / nilaiValid.length).toFixed(1);
  }

  const tidakBisaLihat = mapelSaya.length === 0 || kelasSaya.length === 0;

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL GURU
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Generate Nilai
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Rekap nilai asesmen per mapel dan kelas.
          </p>
        </div>
      </section>

      {tidakBisaLihat && !loadingMe && (
        <div className="mb-6 rounded-2xl border border-[#3d6687]/10 bg-[#4b7899]/10 px-4 py-3 text-sm text-[#3d6687]">
          Kamu belum di-assign ke mapel atau kelas apapun. Hubungi admin untuk di-assign dulu.
        </div>
      )}

      {!tidakBisaLihat && (
        <>
          {/* Filter */}
          <div className="mb-5 rounded-[24px] border border-[#3d6687]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Mapel
                </label>
                <select
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                >
                  {mapelSaya.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Kelas
                </label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                >
                  {kelasSaya.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table Rekap */}
          <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Rekap Nilai</p>
                <h2 className="mt-1 text-lg font-bold text-[#1d3345]">{mapel} · {kelas}</h2>
              </div>
              <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
                {rekap.length} Siswa
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {loadingRekap && (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
                  <p className="text-sm text-[#1d3345]/50">Memuat rekap nilai...</p>
                </div>
              )}

              {!loadingRekap && asesmenList.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
                  <p className="text-sm font-medium text-[#1d3345]/50">
                    Belum ada asesmen untuk kombinasi mapel dan kelas ini.
                  </p>
                </div>
              )}

              {!loadingRekap && asesmenList.length > 0 && rekap.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
                  <p className="text-sm font-medium text-[#1d3345]/50">
                    Belum ada siswa yang mengerjakan asesmen ini.
                  </p>
                </div>
              )}

              {!loadingRekap && asesmenList.length > 0 && rekap.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                      <tr>
                        <th className="px-4 py-3 font-bold sticky left-0 bg-[#c3c4c0]/20">Nama</th>
                        {asesmenList.map((a) => (
                          <th key={a._id} className="px-4 py-3 font-bold whitespace-nowrap">{a.judul}</th>
                        ))}
                        <th className="px-4 py-3 font-bold whitespace-nowrap">Rata-rata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekap.map((row, idx) => (
                        <tr key={idx} className="border-t border-[#3d6687]/[0.08]">
                          <td className="px-4 py-3 font-semibold text-[#1d3345] sticky left-0 bg-white">
                            {row.siswa.name}
                          </td>
                          {asesmenList.map((a) => {
                            const n = row.nilai[a._id];
                            return (
                              <td key={a._id} className="px-4 py-3 text-[#1d3345]/70">
                                {n ? (
                                  <span
                                    className={
                                      n.status === "menunggu_penilaian"
                                        ? "text-amber-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {n.nilaiTotal}
                                    {n.status === "menunggu_penilaian" && " *"}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 font-bold text-[#3d6687]">{rataRata(row)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-[#1d3345]/40">
                    * Nilai masih sementara, ada esai yang belum dinilai.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}