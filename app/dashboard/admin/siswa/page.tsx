"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";

const JURUSAN_LIST = ["PPLG", "MPLB", "PM", "TJKT", "DV", "Perhotelan"];
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

  // Kelas mana yang lagi dipilih buat ditampilkan daftar siswanya
  const [activeKelasNama, setActiveKelasNama] = useState<string | null>(null);
  // 3 dropdown berjenjang buat milih kelas yang mau dilihat
  const [viewTingkat, setViewTingkat] = useState("X");
  const [viewJurusan, setViewJurusan] = useState(JURUSAN_LIST[0]);
  const [viewNomor, setViewNomor] = useState("");

  // Modal edit siswa
  const [editTarget, setEditTarget] = useState<Siswa | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editTingkat, setEditTingkat] = useState("X");
  const [editJurusan, setEditJurusan] = useState(JURUSAN_LIST[0]);
  const [editKelas, setEditKelas] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Cuma kelas yang tingkat & jurusannya cocok sama pilihan form di atas
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

  // Update pilihan kelas di form setiap tingkat/jurusan berubah
  useEffect(() => {
    const match = kelasList.filter(
      (k) => k.tingkat === tingkat && k.jurusan === jurusan
    );
    setKelas(match.length > 0 ? match[0].nama : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tingkat, jurusan, kelasList]);

  // Nomor kelas yang tersedia untuk kombinasi Tingkat+Jurusan yang dipilih,
  // diambil dari kelas yang beneran ada (bukan di-hardcode 1-5)
  const viewNomorList = kelasList
    .filter((k) => k.tingkat === viewTingkat && k.jurusan === viewJurusan)
    .map((k) => k.nama.split(" ").pop() ?? "")
    .sort((a, b) => Number(a) - Number(b));

  // Kalau ada ?kelas=... di URL (misal dari link "Lihat Siswa" di halaman
  // Kelas), pecah jadi tingkat/jurusan/nomor dan set 3 dropdown-nya
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

  // Setiap Tingkat/Jurusan berubah, pastikan Nomor yang dipilih masih valid
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

  // Nama kelas lengkap hasil gabungan 3 dropdown, ini yang dipakai buat filter siswa
  useEffect(() => {
    if (!viewNomor) {
      setActiveKelasNama(null);
      return;
    }
    setActiveKelasNama(`${viewTingkat} ${viewJurusan} ${viewNomor}`);
  }, [viewTingkat, viewJurusan, viewNomor]);

  // Kalau Tingkat/Jurusan di modal edit berubah, pastikan kelas yang dipilih
  // masih valid untuk kombinasi baru itu
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

  // Kelas yang cocok buat dropdown di modal edit
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
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Manajemen Siswa
      </h1>
      <p className="text-ink/60 mb-6">Tambah dan kelola akun siswa.</p>

      {kelasList.length === 0 && !loading && (
        <div className="mb-6 rounded-lg bg-brand-100 text-brand-700 text-sm px-4 py-3">
          Belum ada kelas. Buat kelas dulu di halaman{" "}
          <a href="/dashboard/admin/kelas" className="underline font-medium">
            Manajemen Kelas
          </a>{" "}
          sebelum menambah siswa.
        </div>
      )}

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
            placeholder="Nama siswa"
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
            placeholder="siswa@citranegara.sch.id"
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

        <div>
          <label className="block text-xs font-medium text-ink/70 mb-1">Kelas</label>
          <select
            required
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            disabled={filteredKelas.length === 0}
            className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
          >
            {filteredKelas.length === 0 && (
              <option value="">Belum ada kelas {tingkat} {jurusan}</option>
            )}
            {filteredKelas.map((k) => (
              <option key={k._id} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting || filteredKelas.length === 0}
          className="rounded-full bg-brand-500 text-white px-5 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Menambah..." : "Tambah Siswa"}
        </button>

        {error && <p className="text-sm text-red-600 w-full">{error}</p>}
      </form>

      {loading && (
        <div className="bg-white rounded-xl border border-ink/10 px-4 py-6 text-center text-ink/50 text-sm">
          Memuat...
        </div>
      )}

      {!loading && kelasList.length === 0 && (
        <div className="bg-white rounded-xl border border-ink/10 px-4 py-6 text-center text-ink/50 text-sm">
          Belum ada kelas untuk ditampilkan.
        </div>
      )}

      {!loading && kelasList.length > 0 && (
        <>
          {/* 3 dropdown berjenjang buat pilih kelas yang mau dilihat */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">
                Tingkat
              </label>
              <select
                value={viewTingkat}
                onChange={(e) => setViewTingkat(e.target.value)}
                className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500 bg-white"
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
                value={viewJurusan}
                onChange={(e) => setViewJurusan(e.target.value)}
                className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500 bg-white"
              >
                {JURUSAN_LIST.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">
                Kelas ke-
              </label>
              <select
                value={viewNomor}
                onChange={(e) => setViewNomor(e.target.value)}
                disabled={viewNomorList.length === 0}
                className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500 bg-white"
              >
                {viewNomorList.length === 0 && <option value="">-</option>}
                {viewNomorList.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
            <div className="px-4 py-3 bg-brand-50 border-b border-ink/10">
              <h2 className="font-semibold text-plum-700 text-sm">
                Siswa {activeKelasNama}
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-ink/60">
                <tr>
                  <th className="px-4 py-2 font-medium">Nama</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaDiKelasAktif.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                      Belum ada siswa di kelas ini.
                    </td>
                  </tr>
                )}
                {siswaDiKelasAktif.map((s) => (
                  <tr key={s._id} className="border-t border-ink/5">
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
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

      {/* Modal Edit Siswa */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <h3 className="font-semibold text-plum-700 mb-4">Edit Siswa</h3>
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

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1">
                  Kelas
                </label>
                <select
                  required
                  value={editKelas}
                  onChange={(e) => setEditKelas(e.target.value)}
                  disabled={editFilteredKelas.length === 0}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-plum-500"
                >
                  {editFilteredKelas.length === 0 && (
                    <option value="">
                      Belum ada kelas {editTingkat} {editJurusan}
                    </option>
                  )}
                  {editFilteredKelas.map((k) => (
                    <option key={k._id} value={k.nama}>
                      {k.nama}
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
                  disabled={editSubmitting || editFilteredKelas.length === 0}
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
