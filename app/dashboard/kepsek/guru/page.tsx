"use client";

import { useEffect, useState } from "react";

interface GuruItem {
  _id: string;
  name: string;
  email: string;
  mapel: string[];
  kelasDiampu: string[];
  jumlahTugas: number;
  jumlahAsesmen: number;
}

export default function LihatGuruKepsekPage() {
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/laporan/guru")
      .then((res) => res.json())
      .then((data) => setGuruList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = guruList.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL KEPALA SEKOLAH
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Lihat Guru
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Daftar guru beserta mapel, kelas yang diampu, dan aktivitasnya.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Semua Guru</h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama guru..."
              className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10 sm:w-56"
            />
            <span className="shrink-0 rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
              {guruList.length} Guru
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
              <tr>
                <th className="px-6 py-4 font-bold">Nama</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Mapel</th>
                <th className="px-6 py-4 font-bold">Kelas Diampu</th>
                <th className="px-6 py-4 font-bold text-center">Tugas</th>
                <th className="px-6 py-4 font-bold text-center">Asesmen</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Tidak ada guru ditemukan.
                  </td>
                </tr>
              )}
              {filtered.map((g) => (
                <tr key={g._id} className="border-t border-[#3d6687]/[0.08]">
                  <td className="px-6 py-4 font-semibold text-[#1d3345]">{g.name}</td>
                  <td className="px-6 py-4 text-[#1d3345]/60">{g.email}</td>
                  <td className="px-6 py-4 text-[#1d3345]/60">
                    {g.mapel.length > 0 ? g.mapel.join(", ") : "-"}
                  </td>
                  <td className="px-6 py-4 text-[#1d3345]/60">
                    {g.kelasDiampu.length > 0 ? g.kelasDiampu.join(", ") : "-"}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#3d6687]">{g.jumlahTugas}</td>
                  <td className="px-6 py-4 text-center font-bold text-[#3d6687]">{g.jumlahAsesmen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}