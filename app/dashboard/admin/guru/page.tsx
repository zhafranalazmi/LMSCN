"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

interface Guru {
  _id: string;
  name: string;
  email: string;
  mapel: string[];
  walasKelas: string | null;
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

  // Form tambah guru
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedMapel, setSelectedMapel] = useState<string[]>([]);
  const [walasKelas, setWalasKelas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal edit guru
  const [editTarget, setEditTarget] = useState<Guru | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editMapel, setEditMapel] = useState<string[]>([]);
  const [editWalasKelas, setEditWalasKelas] = useState("");
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

  // Kelas yang belum punya wali kelas (buat form tambah), plus kelas yang
  // lagi diwalikan oleh guru yang sedang diedit (biar gak ilang dari opsi)
  const kelasBelumAdaWalas = kelasList.filter(
    (k) => !guruList.some((g) => g.walasKelas === k.nama)
  );
  const kelasUntukEdit = kelasList.filter(
    (k) =>
      !guruList.some((g) => g.walasKelas === k.nama && g._id !== editTarget?._id)
  );

  function toggleSelectedMapel(nama: string) {
    setSelectedMapel((prev) =>
      prev.includes(nama) ? prev.filter((m) => m !== nama) : [...prev, nama]
    );
  }

  function toggleEditMapel(nama: string) {
    setEditMapel((prev) =>
      prev.includes(nama) ? prev.filter((m) => m !== nama) : [...prev, nama]
    );
  }

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
        walasKelas: walasKelas || null,
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
    setWalasKelas("");
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
    setEditWalasKelas(g.walasKelas ?? "");
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
        walasKelas: editWalasKelas || null,
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
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Manajemen Guru & Mata Pelajaran
      </h1>
      <p className="text-ink/60 mb-6">
        Kelola data guru, mata pelajaran, dan wali kelas.
      </p>

      {/* Ringkasan Mapel, kelola lengkap di halaman terpisah */}
      <div className="bg-white rounded-xl border border-ink/10 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-plum-700 text-sm">Mata Pelajaran</h2>
          <Link
            href="/dashboard/admin/mapel"
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            + Tambah Mapel Baru
          </Link>
        </div>

        {mapelList.length === 0 && (
          <p className="text-sm text-ink/50">
            Belum ada mapel. Tambah dulu di halaman{" "}
            <Link href="/dashboard/admin/mapel" className="underline font-medium">
              Manajemen Mapel
            </Link>
            .
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {mapelList.map((m) => (
            <span
              key={m._id}
              className="rounded-full bg-brand-50 text-ink/80 text-xs px-3 py-1.5"
            >
              {m.nama}
            </span>
          ))}
        </div>
      </div>

      {/* Form Tambah Guru */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-ink/10 p-5 mb-6"
      >
        <h2 className="font-semibold text-plum-700 text-sm mb-3">Tambah Guru</h2>

        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">Nama</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama guru"
              className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guru@citranegara.sch.id"
              className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">
              Password Awal
            </label>
            <input
              required
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">
              Wali Kelas (opsional)
            </label>
            <select
              value={walasKelas}
              onChange={(e) => setWalasKelas(e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
            >
              <option value="">Bukan wali kelas</option>
              {kelasBelumAdaWalas.map((k) => (
                <option key={k._id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-ink/70 mb-2">
            Mata Pelajaran yang Diajar
          </label>
          {mapelList.length === 0 && (
            <p className="text-sm text-ink/50">
              Belum ada mapel, tambah dulu di atas.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {mapelList.map((m) => (
              <label
                key={m._id}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  selectedMapel.includes(m.nama)
                    ? "bg-plum-700 text-white border-plum-700"
                    : "bg-white text-ink/70 border-ink/15 hover:border-plum-300"
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

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-500 text-white px-5 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Menambah..." : "Tambah Guru"}
        </button>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </form>

      {/* Daftar Guru */}
      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Mapel</th>
              <th className="px-4 py-3 font-medium">Wali Kelas</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/50">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && guruList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/50">
                  Belum ada guru.
                </td>
              </tr>
            )}
            {guruList.map((g) => (
              <tr key={g._id} className="border-t border-ink/5">
                <td className="px-4 py-3">{g.name}</td>
                <td className="px-4 py-3">{g.email}</td>
                <td className="px-4 py-3">
                  {g.mapel && g.mapel.length > 0 ? g.mapel.join(", ") : "-"}
                </td>
                <td className="px-4 py-3">{g.walasKelas ?? "-"}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => openEdit(g)}
                    className="text-brand-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(g._id)}
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

      {/* Modal Edit Guru */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <h3 className="font-semibold text-plum-700 mb-4">Edit Guru</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Nama
                </label>
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Password Baru (opsional)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan kalau gak diubah"
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Wali Kelas
                </label>
                <select
                  value={editWalasKelas}
                  onChange={(e) => setEditWalasKelas(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                >
                  <option value="">Bukan wali kelas</option>
                  {kelasUntukEdit.map((k) => (
                    <option key={k._id} value={k.nama}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-2">
                  Mata Pelajaran
                </label>
                <div className="flex flex-wrap gap-2">
                  {mapelList.map((m) => (
                    <label
                      key={m._id}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        editMapel.includes(m.nama)
                          ? "bg-plum-700 text-white border-plum-700"
                          : "bg-white text-ink/70 border-ink/15 hover:border-plum-300"
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
    </div>
  );
}
