"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";

const JURUSAN_LIST = ["PPLG", "MPLB", "PM", "TJKT", "DKV", "Perhotelan"];
const TINGKAT_LIST = ["X", "XI", "XII"];

interface Siswa {
  _id: string;
  name: string;
  email: string;
  jurusan: string;
  kelas: string;
}

interface Kelas {
  _id: string;
  nama: string;
  tingkat: string;
  jurusan: string;
}

export default function SiswaPage() {
  const searchParams = useSearchParams();
  const kelasDariUrl = searchParams.get("kelas");

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tingkat, setTingkat] = useState("X");
  const [jurusan, setJurusan] = useState(JURUSAN_LIST[0]);
  const [kelas, setKelas] = useState("");

  const [activeKelasNama, setActiveKelasNama] = useState<string | null>(null);
  const [viewTingkat, setViewTingkat] = useState("X");
  const [viewJurusan, setViewJurusan] = useState(JURUSAN_LIST[0]);
  const [viewNomor, setViewNomor] = useState("");

  const [editTarget, setEditTarget] = useState<Siswa | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editTingkat, setEditTingkat] = useState("X");
  const [editJurusan, setEditJurusan] = useState(JURUSAN_LIST[0]);
  const [editKelas, setEditKelas] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const filteredKelas = kelasList.filter(
    (k) => k.tingkat === tingkat && k.jurusan === jurusan
  );

  async function loadData() {
    setLoading(true);
    const [siswaRes, kelasRes] = await Promise.all([
      fetch("/api/admin/siswa"),
      fetch("/api/admin/kelas"),
    ]);
    const siswaData = await siswaRes.json();
    const kelasData = await kelasRes.json();
    setSiswaList(Array.isArray(siswaData) ? siswaData : []);
    setKelasList(Array.isArray(kelasData) ? kelasData : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const match = kelasList.filter(
      (k) => k.tingkat === tingkat && k.jurusan === jurusan
    );
    setKelas(match.length > 0 ? match[0].nama : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tingkat, jurusan, kelasList]);

  const viewNomorList = kelasList
    .filter((k) => k.tingkat === viewTingkat && k.jurusan === viewJurusan)
    .map((k) => k.nama.split(" ").pop() ?? "")
    .sort((a, b) => Number(a) - Number(b));

  useEffect(() => {
    if (!kelasDariUrl || kelasList.length === 0) return;
    const match = kelasList.find((k) => k.nama === kelasDariUrl);
    if (match) {
      setViewTingkat(match.tingkat);
      setViewJurusan(match.jurusan);
      setViewNomor(match.nama.split(" ").pop() ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasDariUrl, kelasList]);

  useEffect(() => {
    if (viewNomorList.length === 0) {
      setViewNomor("");
      return;
    }
    if (!viewNomorList.includes(viewNomor)) {
      setViewNomor(viewNomorList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTingkat, viewJurusan, kelasList]);

  useEffect(() => {
    if (!viewNomor) {
      setActiveKelasNama(null);
      return;
    }
    setActiveKelasNama(`${viewTingkat} ${viewJurusan} ${viewNomor}`);
  }, [viewTingkat, viewJurusan, viewNomor]);

  useEffect(() => {
    if (!editTarget) return;
    const match = kelasList.filter(
      (k) => k.tingkat === editTingkat && k.jurusan === editJurusan
    );
    if (match.length > 0 && !match.some((k) => k.nama === editKelas)) {
      setEditKelas(match[0].nama);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTingkat, editJurusan]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/siswa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, jurusan, kelas }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal menambah siswa");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setActiveKelasNama(kelas);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus siswa ini?")) return;
    await fetch(`/api/admin/siswa/${id}`, { method: "DELETE" });
    loadData();
  }

  const editFilteredKelas = kelasList.filter(
    (k) => k.tingkat === editTingkat && k.jurusan === editJurusan
  );

  function openEdit(s: Siswa) {
    setEditTarget(s);
    setEditName(s.name);
    setEditEmail(s.email);
    setEditPassword("");
    setEditJurusan(s.jurusan);
    const kelasMilikSiswa = kelasList.find((k) => k.nama === s.kelas);
    setEditTingkat(kelasMilikSiswa?.tingkat ?? "X");
    setEditKelas(s.kelas);
    setEditError(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError(null);

    const res = await fetch(`/api/admin/siswa/${editTarget._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        password: editPassword || undefined,
        jurusan: editJurusan,
        kelas: editKelas,
      }),
    });

    setEditSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.message ?? "Gagal mengedit siswa");
      return;
    }

    setEditTarget(null);
    await loadData();
    setActiveKelasNama(editKelas);
  }

  const siswaDiKelasAktif = siswaList.filter((s) => s.kelas === activeKelasNama);

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            ADMINISTRASI AKADEMIK
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Manajemen Siswa
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Tambah dan kelola akun siswa berdasarkan kelas.
          </p>
        </div>
      </section>

      {kelasList.length === 0 && !loading && (
        <div className="mb-6 rounded-2xl border border-[#3d6687]/10 bg-[#4b7899]/10 px-4 py-3 text-sm text-[#3d6687]">
          Belum ada kelas. Buat kelas dulu di halaman{" "}
          <a href="/dashboard/admin/kelas" className="font-semibold underline">
            Manajemen Kelas
          </a>{" "}
          sebelum menambah siswa.
        </div>
      )}

      {/* Form Tambah */}
      <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#1d3345]">Tambah Siswa Baru</h2>
          <p className="text-sm text-[#1d3345]/55">
            Isi data siswa dan pilih kelas tujuan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
              Nama
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama siswa"
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
              placeholder="siswa@citranegara.sch.id"
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

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
              Tingkat
            </label>
            <select
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
              className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
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
              value={jurusan}
              onChange={(e) => setJurusan(e.target.value)}
              className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              {JURUSAN_LIST.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
              Kelas
            </label>
            <select
              required
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              disabled={filteredKelas.length === 0}
              className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              {filteredKelas.length === 0 && (
                <option value="">Belum ada kelas {tingkat} {jurusan}</option>
              )}
              {filteredKelas.map((k) => (
                <option key={k._id} value={k.nama}>{k.nama}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || filteredKelas.length === 0}
            className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menambah..." : "+ Tambah Siswa"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      {/* Loading / Empty */}
      {loading && (
        <div className="rounded-[24px] border border-[#3d6687]/10 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
          <p className="text-sm font-medium text-[#1d3345]/50">Memuat data...</p>
        </div>
      )}

      {!loading && kelasList.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-[#3d6687]/20 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#1d3345]/50">
            Belum ada kelas untuk ditampilkan.
          </p>
        </div>
      )}

      {!loading && kelasList.length > 0 && (
        <section className="space-y-5">
          {/* Filter 3 dropdown berjenjang */}
          <div className="rounded-[24px] border border-[#3d6687]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3">
              <h2 className="font-bold text-[#1d3345]">Lihat Siswa per Kelas</h2>
              <p className="text-xs text-[#1d3345]/50">Pilih tingkat, jurusan, dan nomor kelas.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={viewTingkat}
                onChange={(e) => setViewTingkat(e.target.value)}
                className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              >
                {TINGKAT_LIST.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={viewJurusan}
                onChange={(e) => setViewJurusan(e.target.value)}
                className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              >
                {JURUSAN_LIST.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>

              <select
                value={viewNomor}
                onChange={(e) => setViewNomor(e.target.value)}
                disabled={viewNomorList.length === 0}
                className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-2.5 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              >
                {viewNomorList.length === 0 && <option value="">-</option>}
                {viewNomorList.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Siswa</p>
                <h2 className="mt-1 text-lg font-bold text-[#1d3345]">{activeKelasNama ?? "-"}</h2>
              </div>
              <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
                {siswaDiKelasAktif.length} Siswa
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaDiKelasAktif.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-[#1d3345]/50">
                        Belum ada siswa di kelas ini.
                      </td>
                    </tr>
                  )}
                  {siswaDiKelasAktif.map((s) => (
                    <tr
                      key={s._id}
                      className="border-t border-[#3d6687]/[0.08] transition hover:bg-[#4b7899]/[0.035]"
                    >
                      <td className="px-6 py-4 font-semibold text-[#1d3345]">{s.name}</td>
                      <td className="px-6 py-4 text-[#1d3345]/60">{s.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
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
          <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#3d6687] to-[#4b7899] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Data Siswa</p>
              <h3 className="mt-1 text-xl font-bold">Edit Siswa</h3>
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

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Kelas
                </label>
                <select
                  required
                  value={editKelas}
                  onChange={(e) => setEditKelas(e.target.value)}
                  disabled={editFilteredKelas.length === 0}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                >
                  {editFilteredKelas.length === 0 && (
                    <option value="">Belum ada kelas {editTingkat} {editJurusan}</option>
                  )}
                  {editFilteredKelas.map((k) => (
                    <option key={k._id} value={k.nama}>{k.nama}</option>
                  ))}
                </select>
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
                  disabled={editSubmitting || editFilteredKelas.length === 0}
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