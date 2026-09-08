"use client";

import { useEffect, useState, FormEvent } from "react";

interface Mapel {
  _id: string;
  nama: string;
}

export default function MapelPage() {
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);

  const [namaMapelBaru, setNamaMapelBaru] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  async function loadMapel() {
    setLoading(true);
    const res = await fetch("/api/admin/mapel");
    const data = await res.json();
    setMapelList(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadMapel();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/mapel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: namaMapelBaru }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal menambah mapel");
      return;
    }

    setNamaMapelBaru("");
    loadMapel();
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Hapus mapel ini? Mapel ini akan dilepas dari semua guru yang mengajarnya."
      )
    )
      return;
    await fetch(`/api/admin/mapel/${id}`, { method: "DELETE" });
    loadMapel();
  }

  const filteredMapel = mapelList.filter((m) =>
    m.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            ADMINISTRASI AKADEMIK
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Manajemen Mata Pelajaran
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Tambah dan kelola daftar mata pelajaran. Mapel yang ada di sini akan
            muncul sebagai pilihan saat menambah guru.
          </p>
        </div>
      </section>

      {/* Form Tambah */}
      <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#1d3345]">Tambah Mapel Baru</h2>
          <p className="text-sm text-[#1d3345]/55">
            Masukkan nama mata pelajaran yang belum ada di daftar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            required
            value={namaMapelBaru}
            onChange={(e) => setNamaMapelBaru(e.target.value)}
            placeholder="Nama mapel, misal: Matematika"
            className="flex-1 rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menambah..." : "+ Tambah Mapel"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Aktif</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Semua Mapel</h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mapel..."
              className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10 sm:w-56"
            />
            <span className="w-fit shrink-0 rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
              {mapelList.length} Mapel
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
              <tr>
                <th className="px-6 py-4 font-bold">Nama Mapel</th>
                <th className="px-6 py-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && mapelList.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Belum ada mapel.
                  </td>
                </tr>
              )}
              {!loading && mapelList.length > 0 && filteredMapel.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Tidak ditemukan.
                  </td>
                </tr>
              )}
              {filteredMapel.map((m, index) => (
                <tr
                  key={m._id}
                  className="border-t border-[#3d6687]/[0.08] transition hover:bg-[#4b7899]/[0.035]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b7899]/10 text-[10px] font-black text-[#3d6687]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-[#1d3345]">{m.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}