"use client";

import { useEffect, useState } from "react";

interface Siswa {
  _id: string;
  name: string;
  email: string;
}

export default function KelasSayaPage() {
  const [kelasDiampu, setKelasDiampu] = useState<string[]>([]);
  const [activeKelas, setActiveKelas] = useState<string | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(false);

  useEffect(() => {
    async function loadKelas() {
      setLoadingKelas(true);
      const res = await fetch("/api/guru/kelas-saya");
      const data = await res.json();
      const list: string[] = Array.isArray(data.kelasDiampu) ? data.kelasDiampu : [];
      setKelasDiampu(list);
      setActiveKelas(list.length > 0 ? list[0] : null);
      setLoadingKelas(false);
    }
    loadKelas();
  }, []);

  useEffect(() => {
    if (!activeKelas) {
      setSiswaList([]);
      return;
    }
    async function loadSiswa() {
      setLoadingSiswa(true);
      const res = await fetch(`/api/guru/siswa?kelas=${encodeURIComponent(activeKelas!)}`);
      const data = await res.json();
      setSiswaList(Array.isArray(data) ? data : []);
      setLoadingSiswa(false);
    }
    loadSiswa();
  }, [activeKelas]);

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL GURU
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Kelas Saya
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Lihat daftar siswa di kelas yang kamu ampu.
          </p>
        </div>
      </section>

      {/* Loading kelas */}
      {loadingKelas && (
        <div className="rounded-[24px] border border-[#3d6687]/10 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
          <p className="text-sm font-medium text-[#1d3345]/50">Memuat data kelas...</p>
        </div>
      )}

      {/* Belum diassign kelas apapun */}
      {!loadingKelas && kelasDiampu.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-[#3d6687]/20 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4b7899]/10 text-xl">
            🏫
          </div>
          <h3 className="font-bold text-[#1d3345]">Belum ada kelas</h3>
          <p className="mt-1 text-sm text-[#1d3345]/50">
            Kamu belum di-assign ke kelas manapun oleh admin.
          </p>
        </div>
      )}

      {!loadingKelas && kelasDiampu.length > 0 && (
        <section className="space-y-5">
          {/* Tab pilih kelas */}
          <div className="rounded-[24px] border border-[#3d6687]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#1d3345]">Kelas yang Diampu</h2>
                <p className="text-xs text-[#1d3345]/50">Pilih kelas untuk melihat daftar siswanya.</p>
              </div>
              <span className="rounded-full bg-[#4b7899]/10 px-3 py-1 text-xs font-bold text-[#3d6687]">
                {kelasDiampu.length} Kelas
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {kelasDiampu.map((nama) => (
                <button
                  key={nama}
                  onClick={() => setActiveKelas(nama)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    activeKelas === nama
                      ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                      : "border-[#3d6687]/10 bg-[#f8fafb] text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
                  }`}
                >
                  {nama}
                </button>
              ))}
            </div>
          </div>

          {/* Table siswa */}
          <div className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Siswa</p>
                <h2 className="mt-1 text-lg font-bold text-[#1d3345]">{activeKelas}</h2>
              </div>
              <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
                {siswaList.length} Siswa
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingSiswa && (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-[#1d3345]/50">
                        Memuat siswa...
                      </td>
                    </tr>
                  )}
                  {!loadingSiswa && siswaList.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-[#1d3345]/50">
                        Belum ada siswa di kelas ini.
                      </td>
                    </tr>
                  )}
                  {siswaList.map((s, index) => (
                    <tr
                      key={s._id}
                      className="border-t border-[#3d6687]/[0.08] transition hover:bg-[#4b7899]/[0.035]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b7899]/10 text-[10px] font-black text-[#3d6687]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-semibold text-[#1d3345]">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#1d3345]/60">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}