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
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Akun Kepala Sekolah & Kurikulum
      </h1>
      <p className="text-ink/60 mb-6">
        Kelola akun untuk role Kepala Sekolah dan Kurikulum.
      </p>

      {/* Tab pilih role */}
      <div className="flex gap-2 mb-6">
        {(["kepsek", "kurikulum"] as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => {
              setActiveRole(role);
              resetForm();
            }}
            className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
              activeRole === role
                ? "bg-plum-700 text-white border-plum-700"
                : "bg-white text-ink/70 border-ink/15 hover:border-plum-300"
            }`}
          >
            {ROLE_LABEL[role]}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-ink/10 p-5 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-ink/70 mb-1">Nama</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Nama ${ROLE_LABEL[activeRole]}`}
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
            placeholder="nama@citranegara.sch.id"
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

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-500 text-white px-5 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Menambah..." : `Tambah ${ROLE_LABEL[activeRole]}`}
        </button>

        {error && <p className="text-sm text-red-600 w-full">{error}</p>}
      </form>

      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && currentList.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                  Belum ada akun {ROLE_LABEL[activeRole]}.
                </td>
              </tr>
            )}
            {currentList.map((a) => (
              <tr key={a._id} className="border-t border-ink/5">
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3">{a.email}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => openEdit(a)}
                    className="text-brand-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
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

      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-plum-700 mb-4">
              Edit {ROLE_LABEL[activeRole]}
            </h3>
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
