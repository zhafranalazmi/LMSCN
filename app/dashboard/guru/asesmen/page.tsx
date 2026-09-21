"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

type TipeSoal = "pg" | "esai";

interface SoalForm {
  tipe: TipeSoal;
  pertanyaan: string;
  pilihan: string[];
  jawabanBenar: number | null;
  poin: number;
}

interface Asesmen {
  _id: string;
  judul: string;
  mapel: string;
  kelas: string;
  durasiMenit: number;
  soal: { _id: string }[];
}

function soalKosong(tipe: TipeSoal): SoalForm {
  return {
    tipe,
    pertanyaan: "",
    pilihan: tipe === "pg" ? ["", ""] : [],
    jawabanBenar: null,
    poin: 10,
  };
}

export default function AsesmenPage() {
  const [asesmenList, setAsesmenList] = useState<Asesmen[]>([]);
  const [mapelSaya, setMapelSaya] = useState<string[]>([]);
  const [kelasSaya, setKelasSaya] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(30);
  const [soalForm, setSoalForm] = useState<SoalForm[]>([soalKosong("pg")]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    setLoading(true);
    const [meRes, asesmenRes] = await Promise.all([
      fetch("/api/guru/me"),
      fetch("/api/guru/asesmen"),
    ]);
    const meData = await meRes.json();
    const asesmenData = await asesmenRes.json();

    setMapelSaya(Array.isArray(meData.mapel) ? meData.mapel : []);
    setKelasSaya(Array.isArray(meData.kelasDiampu) ? meData.kelasDiampu : []);
    setAsesmenList(Array.isArray(asesmenData) ? asesmenData : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (mapelSaya.length > 0 && !mapel) setMapel(mapelSaya[0]);
  }, [mapelSaya]);

  useEffect(() => {
    if (kelasSaya.length > 0 && !kelas) setKelas(kelasSaya[0]);
  }, [kelasSaya]);

  function resetForm() {
    setJudul("");
    setDeskripsi("");
    setDurasiMenit(30);
    setSoalForm([soalKosong("pg")]);
    setShowForm(false);
  }

  function tambahSoal(tipe: TipeSoal) {
    setSoalForm((prev) => [...prev, soalKosong(tipe)]);
  }

  function hapusSoal(index: number) {
    setSoalForm((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSoal(index: number, patch: Partial<SoalForm>) {
    setSoalForm((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function tambahPilihan(index: number) {
    setSoalForm((prev) =>
      prev.map((s, i) => (i === index ? { ...s, pilihan: [...s.pilihan, ""] } : s))
    );
  }

  function hapusPilihan(index: number, pilihanIndex: number) {
    setSoalForm((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const pilihanBaru = s.pilihan.filter((_, pi) => pi !== pilihanIndex);
        const jawabanBenarBaru =
          s.jawabanBenar === pilihanIndex
            ? null
            : s.jawabanBenar !== null && s.jawabanBenar > pilihanIndex
            ? s.jawabanBenar - 1
            : s.jawabanBenar;
        return { ...s, pilihan: pilihanBaru, jawabanBenar: jawabanBenarBaru };
      })
    );
  }

  function updatePilihan(index: number, pilihanIndex: number, value: string) {
    setSoalForm((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const pilihanBaru = [...s.pilihan];
        pilihanBaru[pilihanIndex] = value;
        return { ...s, pilihan: pilihanBaru };
      })
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    for (const s of soalForm) {
      if (!s.pertanyaan.trim()) {
        setError("Semua soal wajib punya pertanyaan");
        return;
      }
      if (s.tipe === "pg") {
        if (s.pilihan.some((p) => !p.trim())) {
          setError("Semua pilihan jawaban wajib diisi");
          return;
        }
        if (s.jawabanBenar === null) {
          setError("Pilih jawaban benar untuk setiap soal PG");
          return;
        }
      }
    }

    setSubmitting(true);

    const res = await fetch("/api/guru/asesmen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judul,
        deskripsi,
        mapel,
        kelas,
        durasiMenit,
        soal: soalForm,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal membuat asesmen");
      return;
    }

    resetForm();
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus asesmen ini? Semua jawaban siswa yang terkait juga akan hilang.")) return;
    await fetch(`/api/guru/asesmen/${id}`, { method: "DELETE" });
    loadData();
  }

  const tidakBisaBuat = mapelSaya.length === 0 || kelasSaya.length === 0;

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL GURU
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Asesmen
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Buat kuis atau ujian online dan nilai jawaban siswa.
          </p>
        </div>
      </section>

      {tidakBisaBuat && !loading && (
        <div className="mb-6 rounded-2xl border border-[#3d6687]/10 bg-[#4b7899]/10 px-4 py-3 text-sm text-[#3d6687]">
          Kamu belum di-assign ke mapel atau kelas apapun. Hubungi admin untuk di-assign dulu
          sebelum bisa membuat asesmen.
        </div>
      )}

      {!tidakBisaBuat && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98]"
        >
          + Buat Asesmen Baru
        </button>
      )}

      {!tidakBisaBuat && showForm && (
        <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1d3345]">Asesmen Baru</h2>
              <p className="text-sm text-[#1d3345]/55">Isi detail dan susun soal-soalnya.</p>
            </div>
            <button
              onClick={resetForm}
              className="rounded-lg px-3 py-2 text-xs font-bold text-[#1d3345]/60 hover:bg-[#1d3345]/5"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Judul Asesmen
              </label>
              <input
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misal: Ulangan Harian Bab 3"
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Deskripsi (opsional)
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={2}
                placeholder="Instruksi tambahan untuk siswa..."
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Mapel
                </label>
                <select
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                >
                  {mapelSaya.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Kelas
                </label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                >
                  {kelasSaya.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Durasi (menit)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              </div>
            </div>

            {/* Daftar Soal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                  Soal ({soalForm.length})
                </label>
              </div>

              {soalForm.map((s, index) => (
                <div key={index} className="rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[#4b7899]/10 px-3 py-1 text-xs font-bold text-[#3d6687]">
                      Soal {index + 1} · {s.tipe === "pg" ? "Pilihan Ganda" : "Esai"}
                    </span>
                    {soalForm.length > 1 && (
                      <button
                        type="button"
                        onClick={() => hapusSoal(index)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Hapus Soal
                      </button>
                    )}
                  </div>

                  <textarea
                    required
                    value={s.pertanyaan}
                    onChange={(e) => updateSoal(index, { pertanyaan: e.target.value })}
                    placeholder="Tulis pertanyaan..."
                    rows={2}
                    className="mb-3 w-full rounded-xl border border-[#3d6687]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                  />

                  {s.tipe === "pg" && (
                    <div className="mb-3 space-y-2">
                      {s.pilihan.map((p, pi) => (
                        <div key={pi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`jawaban-benar-${index}`}
                            checked={s.jawabanBenar === pi}
                            onChange={() => updateSoal(index, { jawabanBenar: pi })}
                            className="h-4 w-4 accent-[#3d6687]"
                          />
                          <input
                            required
                            value={p}
                            onChange={(e) => updatePilihan(index, pi, e.target.value)}
                            placeholder={`Pilihan ${pi + 1}`}
                            className="flex-1 rounded-lg border border-[#3d6687]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#4b7899]"
                          />
                          {s.pilihan.length > 2 && (
                            <button
                              type="button"
                              onClick={() => hapusPilihan(index, pi)}
                              className="text-xs font-bold text-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => tambahPilihan(index)}
                        className="text-xs font-bold text-[#3d6687] hover:underline"
                      >
                        + Tambah Pilihan
                      </button>
                      <p className="text-xs text-[#1d3345]/40">
                        Pilih radio button di sebelah jawaban yang benar.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-[#1d3345]/60">Poin:</label>
                    <input
                      type="number"
                      min={1}
                      value={s.poin}
                      onChange={(e) => updateSoal(index, { poin: Number(e.target.value) })}
                      className="w-20 rounded-lg border border-[#3d6687]/15 bg-white px-2 py-1 text-sm outline-none focus:border-[#4b7899]"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => tambahSoal("pg")}
                  className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                >
                  + Soal Pilihan Ganda
                </button>
                <button
                  type="button"
                  onClick={() => tambahSoal("esai")}
                  className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                >
                  + Soal Esai
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan Asesmen"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </form>
        </section>
      )}

      {/* Daftar Asesmen */}
      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Aktif</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Asesmen yang Kamu Buat</h2>
          </div>
          <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
            {asesmenList.length} Asesmen
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
              <p className="text-sm text-[#1d3345]/50">Memuat asesmen...</p>
            </div>
          )}

          {!loading && asesmenList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#1d3345]/50">
                Belum ada asesmen yang kamu buat.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {asesmenList.map((a) => (
              <div
                key={a._id}
                className="flex flex-col gap-3 rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#1d3345]">{a.judul}</h3>
                    <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                      {a.mapel}
                    </span>
                    <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                      {a.kelas}
                    </span>
                  </div>
                  <p className="text-xs text-[#1d3345]/50">
                    {a.soal.length} soal · {a.durasiMenit} menit
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/guru/asesmen/${a._id}`}
                    className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                  >
                    Lihat Hasil
                  </Link>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}