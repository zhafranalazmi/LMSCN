"use client";

import { useEffect, useState, FormEvent } from "react";

interface Guru {
  _id: string;
  name: string;
  email: string;
  mapel: string[];
  kelasDiampu: string[];
}

interface Mapel {
  _id: string;
  nama: string;
}

interface Kelas {
  _id: string;
  nama: string;
}

export default function GuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedMapel, setSelectedMapel] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
  const [searchMapel, setSearchMapel] = useState("");
  const [searchKelas, setSearchKelas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState<Guru | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editMapel, setEditMapel] = useState<string[]>([]);
  const [editKelas, setEditKelas] = useState<string[]>([]);
  const [editSearchMapel, setEditSearchMapel] = useState("");
  const [editSearchKelas, setEditSearchKelas] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    const [guruRes, mapelRes, kelasRes] = await Promise.all([
      fetch("/api/admin/guru"),
      fetch("/api/admin/mapel"),
      fetch("/api/admin/kelas"),
    ]);
    const guruData = await guruRes.json();
    const mapelData = await mapelRes.json();
    const kelasData = await kelasRes.json();
    setGuruList(Array.isArray(guruData) ? guruData : []);
    setMapelList(Array.isArray(mapelData) ? mapelData : []);
    setKelasList(Array.isArray(kelasData) ? kelasData : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function toggleSelectedMapel(nama: string) {
    setSelectedMapel((prev) =>
      prev.includes(nama) ? prev.filter((m) => m !== nama) : [...prev, nama]
    );
  }

  function toggleSelectedKelas(nama: string) {
    setSelectedKelas((prev) =>
      prev.includes(nama) ? prev.filter((k) => k !== nama) : [...prev, nama]
    );
  }

  function toggleEditMapel(nama: string) {
    setEditMapel((prev) =>
      prev.includes(nama) ? prev.filter((m) => m !== nama) : [...prev, nama]
    );
  }

  function toggleEditKelas(nama: string) {
    setEditKelas((prev) =>
      prev.includes(nama) ? prev.filter((k) => k !== nama) : [...prev, nama]
    );
  }

  const filteredMapelForAdd = mapelList.filter((m) =>
    m.nama.toLowerCase().includes(searchMapel.toLowerCase())
  );
  const filteredKelasForAdd = kelasList.filter((k) =>
    k.nama.toLowerCase().includes(searchKelas.toLowerCase())
  );
  const filteredMapelForEdit = mapelList.filter((m) =>
    m.nama.toLowerCase().includes(editSearchMapel.toLowerCase())
  );
  const filteredKelasForEdit = kelasList.filter((k) =>
    k.nama.toLowerCase().includes(editSearchKelas.toLowerCase())
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/guru", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        mapel: selectedMapel,
        kelasDiampu: selectedKelas,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal menambah guru");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setSelectedMapel([]);
    setSelectedKelas([]);
    setSearchMapel("");
    setSearchKelas("");
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus guru ini?")) return;
    await fetch(`/api/admin/guru/${id}`, { method: "DELETE" });
    loadData();
  }

  function openEdit(g: Guru) {
    setEditTarget(g);
    setEditName(g.name);
    setEditEmail(g.email);
    setEditPassword("");
    setEditMapel(g.mapel ?? []);
    setEditKelas(g.kelasDiampu ?? []);
    setEditSearchMapel("");
    setEditSearchKelas("");
    setEditError(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError(null);

    const res = await fetch(`/api/admin/guru/${editTarget._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        password: editPassword || undefined,
        mapel: editMapel,
        kelasDiampu: editKelas,
      }),
    });

    setEditSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.message ?? "Gagal mengedit guru");
      return;
    }

    setEditTarget(null);
    loadData();
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            ADMINISTRASI AKADEMIK
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Manajemen Guru
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Kelola data guru, mata pelajaran, dan kelas yang diampu.
          </p>
        </div>
      </section>

      {/* Form Tambah Guru */}
      <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#1d3345]">Tambah Guru</h2>
          <p className="text-sm text-[#1d3345]/55">
            Isi data guru, pilih mata pelajaran, dan kelas yang diampu.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Nama
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama guru"
                className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@citranegara.sch.id"
                className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Password Awal
              </label>
              <input
                required
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {/* Pilih Mapel */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Mata Pelajaran
                </label>
                {selectedMapel.length > 0 && (
                  <span className="text-xs font-bold text-[#3d6687]">
                    {selectedMapel.length} dipilih
                  </span>
                )}
              </div>

              {mapelList.length === 0 ? (
                <p className="text-sm text-[#1d3345]/55">
                  Belum ada mapel. Tambahkan dulu di halaman{" "}
                  <a href="/dashboard/admin/mapel" className="font-semibold text-[#3d6687] underline">
                    Manajemen Mapel
                  </a>
                  .
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchMapel}
                    onChange={(e) => setSearchMapel(e.target.value)}
                    placeholder="Cari mata pelajaran..."
                    className="mb-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                  />
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#3d6687]/10 bg-[#f8fafb] p-3">
                    <div className="flex flex-wrap gap-2">
                      {filteredMapelForAdd.length === 0 && (
                        <p className="text-sm text-[#1d3345]/50">Tidak ditemukan.</p>
                      )}
                      {filteredMapelForAdd.map((m) => (
                        <label
                          key={m._id}
                          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                            selectedMapel.includes(m.nama)
                              ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                              : "border-[#3d6687]/10 bg-white text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMapel.includes(m.nama)}
                            onChange={() => toggleSelectedMapel(m.nama)}
                            className="hidden"
                          />
                          {m.nama}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pilih Kelas Diampu */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Kelas yang Diampu
                </label>
                {selectedKelas.length > 0 && (
                  <span className="text-xs font-bold text-[#3d6687]">
                    {selectedKelas.length} dipilih
                  </span>
                )}
              </div>

              {kelasList.length === 0 ? (
                <p className="text-sm text-[#1d3345]/55">
                  Belum ada kelas. Tambahkan dulu di halaman{" "}
                  <a href="/dashboard/admin/kelas" className="font-semibold text-[#3d6687] underline">
                    Manajemen Kelas
                  </a>
                  .
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchKelas}
                    onChange={(e) => setSearchKelas(e.target.value)}
                    placeholder="Cari kelas..."
                    className="mb-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                  />
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#3d6687]/10 bg-[#f8fafb] p-3">
                    <div className="flex flex-wrap gap-2">
                      {filteredKelasForAdd.length === 0 && (
                        <p className="text-sm text-[#1d3345]/50">Tidak ditemukan.</p>
                      )}
                      {filteredKelasForAdd.map((k) => (
                        <label
                          key={k._id}
                          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                            selectedKelas.includes(k.nama)
                              ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                              : "border-[#3d6687]/10 bg-white text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedKelas.includes(k.nama)}
                            onChange={() => toggleSelectedKelas(k.nama)}
                            className="hidden"
                          />
                          {k.nama}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menambah..." : "+ Tambah Guru"}
          </button>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </form>
      </section>

      {/* Daftar Guru */}
      <div className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Aktif</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Semua Guru</h2>
          </div>
          <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
            {guruList.length} Guru
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
              <tr>
                <th className="px-6 py-4 font-bold">Nama</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Mapel</th>
                <th className="px-6 py-4 font-bold">Kelas Diampu</th>
                <th className="px-6 py-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && guruList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Belum ada guru.
                  </td>
                </tr>
              )}
              {guruList.map((g) => (
                <tr
                  key={g._id}
                  className="border-t border-[#3d6687]/[0.08] transition hover:bg-[#4b7899]/[0.035]"
                >
                  <td className="px-6 py-4 font-semibold text-[#1d3345]">{g.name}</td>
                  <td className="px-6 py-4 text-[#1d3345]/60">{g.email}</td>
                  <td className="px-6 py-4 text-[#1d3345]/60">
                    {g.mapel && g.mapel.length > 0 ? g.mapel.join(", ") : "-"}
                  </td>
                  <td className="px-6 py-4 text-[#1d3345]/60">
                    {g.kelasDiampu && g.kelasDiampu.length > 0 ? g.kelasDiampu.join(", ") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(g)}
                        className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(g._id)}
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

      {/* Modal Edit Guru */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d3345]/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#3d6687] to-[#4b7899] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Data Guru</p>
              <h3 className="mt-1 text-xl font-bold">Edit Guru</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Nama
                </label>
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Password Baru (opsional)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan kalau gak diubah"
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                    Mata Pelajaran
                  </label>
                  {editMapel.length > 0 && (
                    <span className="text-xs font-bold text-[#3d6687]">
                      {editMapel.length} dipilih
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={editSearchMapel}
                  onChange={(e) => setEditSearchMapel(e.target.value)}
                  placeholder="Cari mata pelajaran..."
                  className="mb-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
                <div className="max-h-40 overflow-y-auto rounded-xl border border-[#3d6687]/10 bg-[#f8fafb] p-3">
                  <div className="flex flex-wrap gap-2">
                    {filteredMapelForEdit.length === 0 && (
                      <p className="text-sm text-[#1d3345]/50">Tidak ditemukan.</p>
                    )}
                    {filteredMapelForEdit.map((m) => (
                      <label
                        key={m._id}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                          editMapel.includes(m.nama)
                            ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                            : "border-[#3d6687]/10 bg-white text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editMapel.includes(m.nama)}
                          onChange={() => toggleEditMapel(m.nama)}
                          className="hidden"
                        />
                        {m.nama}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                    Kelas yang Diampu
                  </label>
                  {editKelas.length > 0 && (
                    <span className="text-xs font-bold text-[#3d6687]">
                      {editKelas.length} dipilih
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={editSearchKelas}
                  onChange={(e) => setEditSearchKelas(e.target.value)}
                  placeholder="Cari kelas..."
                  className="mb-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
                <div className="max-h-40 overflow-y-auto rounded-xl border border-[#3d6687]/10 bg-[#f8fafb] p-3">
                  <div className="flex flex-wrap gap-2">
                    {filteredKelasForEdit.length === 0 && (
                      <p className="text-sm text-[#1d3345]/50">Tidak ditemukan.</p>
                    )}
                    {filteredKelasForEdit.map((k) => (
                      <label
                        key={k._id}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                          editKelas.includes(k.nama)
                            ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                            : "border-[#3d6687]/10 bg-white text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editKelas.includes(k.nama)}
                          onChange={() => toggleEditKelas(k.nama)}
                          className="hidden"
                        />
                        {k.nama}
                      </label>
                    ))}
                  </div>
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
                  {editSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}