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
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            ADMINISTRASI AKADEMIK
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Manajemen Kelas
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Tambah, kelompokkan, dan kelola daftar kelas berdasarkan tingkat dan jurusan.
          </p>
        </div>
      </section>

      {/* Form Tambah */}
      <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#1d3345]">Tambah Kelas Baru</h2>
          <p className="text-sm text-[#1d3345]/55">
            Pilih tingkat dan jurusan untuk membuat kelas baru.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Tingkat
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              >
                {TINGKAT_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Jurusan
              </label>
              <select
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              >
                {JURUSAN_LIST.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menambah..." : "+ Tambah Kelas"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      {/* Loading */}
      {loading && (
        <div className="rounded-[24px] border border-[#3d6687]/10 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
          <p className="text-sm font-medium text-[#1d3345]/50">Memuat data kelas...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && groupKeys.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-[#3d6687]/20 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4b7899]/10 text-xl">
            🏫
          </div>
          <h3 className="font-bold text-[#1d3345]">Belum ada kelas</h3>
          <p className="mt-1 text-sm text-[#1d3345]/50">
            Tambahkan kelas pertama menggunakan formulir di atas.
          </p>
        </div>
      )}

      {!loading && groupKeys.length > 0 && (
        <section className="space-y-5">
          {/* Filter Jurusan */}
          <div className="rounded-[24px] border border-[#3d6687]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#1d3345]">Kelompok Kelas</h2>
                <p className="text-xs text-[#1d3345]/50">Pilih tingkat dan jurusan untuk melihat daftar kelas.</p>
              </div>
              <span className="rounded-full bg-[#4b7899]/10 px-3 py-1 text-xs font-bold text-[#3d6687]">
                {groupKeys.length} Grup
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {groupKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveGroup(key)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    activeGroup === key
                      ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                      : "border-[#3d6687]/10 bg-[#f8fafb] text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Aktif</p>
                <h2 className="mt-1 text-lg font-bold text-[#1d3345]">{activeGroup}</h2>
              </div>
              <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
                {kelasDiGroupAktif.length} Kelas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama Kelas</th>
                    <th className="px-6 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasDiGroupAktif.map((k, index) => (
                    <tr
                      key={k._id}
                      className="border-t border-[#3d6687]/[0.08] transition hover:bg-[#4b7899]/[0.035]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4b7899]/10 text-xs font-black text-[#3d6687]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-semibold text-[#1d3345]">{k.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openView(k)}
                            className="rounded-lg bg-[#4b7899]/10 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:bg-[#4b7899]/20"
                          >
                            Lihat Siswa
                          </button>
                          <button
                            onClick={() => openEdit(k)}
                            className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(k._id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Modal Edit */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d3345]/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#3d6687] to-[#4b7899] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Pengaturan Kelas</p>
              <h3 className="mt-1 text-xl font-bold">Edit Kelas</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Nama Kelas
                </label>
                <input
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                    Tingkat
                  </label>
                  <select
                    value={editTingkat}
                    onChange={(e) => setEditTingkat(e.target.value)}
                    className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                  >
                    {TINGKAT_LIST.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                    Jurusan
                  </label>
                  <select
                    value={editJurusan}
                    onChange={(e) => setEditJurusan(e.target.value)}
                    className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                  >
                    {JURUSAN_LIST.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="rounded-xl px-5 py-3 text-sm font-bold text-[#1d3345]/60 transition hover:bg-[#1d3345]/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-[#3d6687] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2f5573] disabled:opacity-60"
                >
                  {editSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Siswa */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d3345]/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-gradient-to-r from-[#3d6687] to-[#4b7899] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">Data Peserta Didik</p>
                <h3 className="mt-1 text-xl font-bold">Siswa {viewTarget.nama}</h3>
              </div>
              <button
                onClick={() => setViewTarget(null)}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/20"
              >
                Tutup
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {siswaLoading && (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
                  <p className="text-sm text-[#1d3345]/50">Memuat data siswa...</p>
                </div>
              )}

              {!siswaLoading && siswaDiKelas.length === 0 && (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c3c4c0]/30 text-lg">
                    👨‍🎓
                  </div>
                  <p className="font-semibold text-[#1d3345]">Belum ada siswa</p>
                  <p className="mt-1 text-sm text-[#1d3345]/50">
                    Belum ada siswa yang terdaftar di kelas ini.
                  </p>
                </div>
              )}

              {!siswaLoading && siswaDiKelas.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#3d6687]/10">
                  <table className="w-full text-sm">
                    <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                      <tr>
                        <th className="px-5 py-4 font-bold">Nama</th>
                        <th className="px-5 py-4 font-bold">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siswaDiKelas.map((s) => (
                        <tr key={s._id} className="border-t border-[#3d6687]/[0.08]">
                          <td className="px-5 py-4 font-semibold text-[#1d3345]">{s.name}</td>
                          <td className="px-5 py-4 text-[#1d3345]/60">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
