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

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Manajemen Mata Pelajaran
      </h1>
      <p className="text-ink/60 mb-6">
        Tambah dan kelola daftar mata pelajaran. Mapel yang ada di sini akan
        muncul sebagai pilihan saat menambah guru.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-ink/10 p-5 mb-6 flex gap-2"
      >
        <input
          required
          value={namaMapelBaru}
          onChange={(e) => setNamaMapelBaru(e.target.value)}
          placeholder="Nama mapel, misal: Matematika"
          className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-500 text-white px-5 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Menambah..." : "Tambah Mapel"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nama Mapel</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-ink/50">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && mapelList.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-ink/50">
                  Belum ada mapel.
                </td>
              </tr>
            )}
            {mapelList.map((m) => (
              <tr key={m._id} className="border-t border-ink/5">
                <td className="px-4 py-3">{m.nama}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="text-red-600 hover:underline text-xs font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
