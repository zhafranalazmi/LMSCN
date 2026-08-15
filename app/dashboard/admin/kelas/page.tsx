"use client";

import { useEffect, useState, FormEvent } from "react";

const JURUSAN_LIST = ["PPLG", "MPLB", "PM", "TJKT", "DKV", "Perhotelan"];
const TINGKAT_LIST = ["X", "XI", "XII"];

interface Kelas {
  _id: string;
  nama: string;
  tingkat: string;
  jurusan: string;
}

interface Siswa {
  _id: string;
  name: string;
  email: string;
  jurusan: string;
  kelas: string;
}

export default function KelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [tingkat, setTingkat] = useState("X");
  const [jurusan, setJurusan] = useState(JURUSAN_LIST[0]);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Modal edit kelas
  const [editTarget, setEditTarget] = useState<Kelas | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editTingkat, setEditTingkat] = useState("X");
  const [editJurusan, setEditJurusan] = useState(JURUSAN_LIST[0]);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Modal lihat siswa
  const [viewTarget, setViewTarget] = useState<Kelas | null>(null);
  const [siswaDiKelas, setSiswaDiKelas] = useState<Siswa[]>([]);
  const [siswaLoading, setSiswaLoading] = useState(false);

  async function loadKelas() {
    setLoading(true);
    const res = await fetch("/api/admin/kelas");
    const data = await res.json();
    const list: Kelas[] = Array.isArray(data) ? data : [];
    setKelasList(list);
    setLoading(false);
  }

  useEffect(() => {
    loadKelas();
  }, []);

  const groupKeys = Array.from(
    new Set(kelasList.map((k) => `${k.tingkat} ${k.jurusan}`))
  ).sort((a, b) => {
    const [tingkatA, jurusanA] = a.split(" ");
    const [tingkatB, jurusanB] = b.split(" ");
    const jurusanDiff =
      JURUSAN_LIST.indexOf(jurusanA) - JURUSAN_LIST.indexOf(jurusanB);
    if (jurusanDiff !== 0) return jurusanDiff;
    return TINGKAT_LIST.indexOf(tingkatA) - TINGKAT_LIST.indexOf(tingkatB);
  });

  useEffect(() => {
    if (groupKeys.length === 0) {
      setActiveGroup(null);
      return;
    }
    if (!activeGroup || !groupKeys.includes(activeGroup)) {
      setActiveGroup(groupKeys[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasList]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/kelas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tingkat, jurusan }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal menambah kelas");
      return;
    }

    await loadKelas();
    setActiveGroup(`${tingkat} ${jurusan}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kelas ini?")) return;
    await fetch(`/api/admin/kelas/${id}`, { method: "DELETE" });
    loadKelas();
  }

  function openEdit(k: Kelas) {
    setEditTarget(k);
    setEditNama(k.nama);
    setEditTingkat(k.tingkat);
    setEditJurusan(k.jurusan);
    setEditError(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError(null);

    const res = await fetch(`/api/admin/kelas/${editTarget._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: editNama,
        tingkat: editTingkat,
        jurusan: editJurusan,
      }),
    });

    setEditSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.message ?? "Gagal mengedit kelas");
      return;
    }

    setEditTarget(null);
    await loadKelas();
    setActiveGroup(`${editTingkat} ${editJurusan}`);
  }

  async function openView(k: Kelas) {
    setViewTarget(k);
    setSiswaLoading(true);
    const res = await fetch("/api/admin/siswa");
    const data = await res.json();
    const list: Siswa[] = Array.isArray(data) ? data : [];
    setSiswaDiKelas(list.filter((s) => s.kelas === k.nama));
    setSiswaLoading(false);
  }

  const kelasDiGroupAktif = kelasList.filter(
    (k) => `${k.tingkat} ${k.jurusan}` === activeGroup
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Manajemen Kelas
      </h1>
      <p className="text-ink/60 mb-6">Tambah dan kelola daftar kelas per jurusan.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-ink/10 p-5 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-ink/70 mb-1">
            Tingkat
          </label>
          <select
            value={tingkat}
            onChange={(e) => setTingkat(e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
          >
            {TINGKAT_LIST.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/70 mb-1">
            Jurusan
          </label>
          <select
            value={jurusan}
            onChange={(e) => setJurusan(e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
          >
            {JURUSAN_LIST.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-500 text-white px-5 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Menambah..." : "Tambah Kelas"}
        </button>

        {error && <p className="text-sm text-red-600 w-full">{error}</p>}
      </form>

      {loading && (
        <div className="bg-white rounded-xl border border-ink/10 px-4 py-6 text-center text-ink/50 text-sm">
          Memuat...
        </div>
      )}

      {!loading && groupKeys.length === 0 && (
        <div className="bg-white rounded-xl border border-ink/10 px-4 py-6 text-center text-ink/50 text-sm">
          Belum ada kelas.
        </div>
      )}

      {!loading && groupKeys.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {groupKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                  activeGroup === key
                    ? "bg-plum-700 text-white border-plum-700"
                    : "bg-white text-ink/70 border-ink/15 hover:border-plum-300"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
            <div className="px-4 py-3 bg-brand-50 border-b border-ink/10">
              <h2 className="font-semibold text-plum-700 text-sm">{activeGroup}</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-ink/60">
                <tr>
                  <th className="px-4 py-2 font-medium">Nama Kelas</th>
                  <th className="px-4 py-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kelasDiGroupAktif.map((k) => (
                  <tr key={k._id} className="border-t border-ink/5">
                    <td className="px-4 py-3">{k.nama}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openView(k)}
                        className="text-plum-700 hover:underline text-xs font-medium"
                      >
                        Lihat Siswa
                      </button>
                      <button
                        onClick={() => openEdit(k)}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(k._id)}
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
        </>
      )}

      {/* Modal Edit Kelas */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-plum-700 mb-4">Edit Kelas</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Nama Kelas
                </label>
                <input
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Tingkat
                </label>
                <select
                  value={editTingkat}
                  onChange={(e) => setEditTingkat(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                >
                  {TINGKAT_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Jurusan
                </label>
                <select
                  value={editJurusan}
                  onChange={(e) => setEditJurusan(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                >
                  {JURUSAN_LIST.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {editError && <p className="text-sm text-red-600">{editError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-full bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:opacity-60"
                >
                  {editSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Siswa */}
      {viewTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-plum-700">
                Siswa {viewTarget.nama}
              </h3>
              <button
                onClick={() => setViewTarget(null)}
                className="text-ink/50 hover:text-ink text-sm"
              >
                Tutup
              </button>
            </div>

            {siswaLoading && (
              <p className="text-sm text-ink/50 text-center py-4">Memuat...</p>
            )}

            {!siswaLoading && siswaDiKelas.length === 0 && (
              <p className="text-sm text-ink/50 text-center py-4">
                Belum ada siswa di kelas ini.
              </p>
            )}

            {!siswaLoading && siswaDiKelas.length > 0 && (
              <table className="w-full text-sm">
                <thead className="text-left text-ink/60 border-b border-ink/10">
                  <tr>
                    <th className="py-2 font-medium">Nama</th>
                    <th className="py-2 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaDiKelas.map((s) => (
                    <tr key={s._id} className="border-b border-ink/5">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
