"use client";

import { useEffect, useState, FormEvent } from "react";

type Role = "kepsek" | "kurikulum";

interface Akun {
  _id: string;
  name: string;
  email: string;
}

const ROLE_LABEL: Record<Role, string> = {
  kepsek: "Kepala Sekolah",
  kurikulum: "Kurikulum",
};

export default function AkunPage() {
  const [activeRole, setActiveRole] = useState<Role>("kepsek");

  const [kepsekList, setKepsekList] = useState<Akun[]>([]);
  const [kurikulumList, setKurikulumList] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState<Akun | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    const [kepsekRes, kurikulumRes] = await Promise.all([
      fetch("/api/admin/kepsek"),
      fetch("/api/admin/kurikulum"),
    ]);
    const kepsekData = await kepsekRes.json();
    const kurikulumData = await kurikulumRes.json();
    setKepsekList(Array.isArray(kepsekData) ? kepsekData : []);
    setKurikulumList(Array.isArray(kurikulumData) ? kurikulumData : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const currentList = activeRole === "kepsek" ? kepsekList : kurikulumList;

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/${activeRole}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal menambah akun");
      return;
    }

    resetForm();
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus akun ini?")) return;
    await fetch(`/api/admin/${activeRole}/${id}`, { method: "DELETE" });
    loadData();
  }

  function openEdit(a: Akun) {
    setEditTarget(a);
    setEditName(a.name);
    setEditEmail(a.email);
    setEditPassword("");
    setEditError(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError(null);

    const res = await fetch(`/api/admin/${activeRole}/${editTarget._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        password: editPassword || undefined,
      }),
    });

    setEditSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.message ?? "Gagal mengedit akun");
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
            ADMINISTRASI AKUN
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Akun Kepala Sekolah & Kurikulum
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Kelola akun untuk role Kepala Sekolah dan Kurikulum.
          </p>
        </div>
      </section>

      {/* Tab pilih role */}
      <div className="mb-6 flex gap-2">
        {(["kepsek", "kurikulum"] as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => {
              setActiveRole(role);
              resetForm();
            }}
            className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition-all ${
              activeRole === role
                ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                : "border-[#3d6687]/10 bg-white text-[#1d3345]/65 hover:border-[#4b7899]/40 hover:bg-[#4b7899]/10 hover:text-[#3d6687]"
            }`}
          >
            {ROLE_LABEL[role]}
          </button>
        ))}
      </div>

      {/* Form Tambah */}
      <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#1d3345]">
            Tambah Akun {ROLE_LABEL[activeRole]}
          </h2>
          <p className="text-sm text-[#1d3345]/55">
            Isi data untuk membuat akun {ROLE_LABEL[activeRole]} baru.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Nama
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Nama ${ROLE_LABEL[activeRole]}`}
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
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
                placeholder="nama@citranegara.sch.id"
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
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
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menambah..." : `+ Tambah ${ROLE_LABEL[activeRole]}`}
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
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">{ROLE_LABEL[activeRole]}</h2>
          </div>
          <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
            {currentList.length} Akun
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
              <tr>
                <th className="px-6 py-4 font-bold">Nama</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && currentList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-[#1d3345]/50">
                    Belum ada akun {ROLE_LABEL[activeRole]}.
                  </td>
                </tr>
              )}
              {currentList.map((a, index) => (
                <tr
                  key={a._id}
                  className="border-t border-[#3d6687]/[0.08] transition hover:bg-[#4b7899]/[0.035]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4b7899]/10 text-[10px] font-black text-[#3d6687]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-[#1d3345]">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#1d3345]/60">{a.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a._id)}
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
      </section>

      {/* Modal Edit */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d3345]/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#3d6687] to-[#4b7899] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Data Akun</p>
              <h3 className="mt-1 text-xl font-bold">Edit {ROLE_LABEL[activeRole]}</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-6">
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