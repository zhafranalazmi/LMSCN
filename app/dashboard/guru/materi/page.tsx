"use client";

import { useEffect, useState, FormEvent } from "react";

interface Materi {
  _id: string;
  judul: string;
  deskripsi: string;
  mapel: string;
  kelas: string;
  tipeLampiran: "link" | "pdf";
  lampiranUrl: string;
  createdAt: string;
}

export default function MateriPage() {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [mapelSaya, setMapelSaya] = useState<string[]>([]);
  const [kelasSaya, setKelasSaya] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");
  const [tipeLampiran, setTipeLampiran] = useState<"link" | "pdf">("link");
  const [linkUrl, setLinkUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [meRes, materiRes] = await Promise.all([
      fetch("/api/guru/me"),
      fetch("/api/guru/materi"),
    ]);
    const meData = await meRes.json();
    const materiData = await materiRes.json();

    setMapelSaya(Array.isArray(meData.mapel) ? meData.mapel : []);
    setKelasSaya(Array.isArray(meData.kelasDiampu) ? meData.kelasDiampu : []);
    setMateriList(Array.isArray(materiData) ? materiData : []);
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
    setLinkUrl("");
    setPdfFile(null);
    setTipeLampiran("link");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (tipeLampiran === "link" && !linkUrl) {
      setError("Link lampiran wajib diisi");
      return;
    }
    if (tipeLampiran === "pdf" && !pdfFile) {
      setError("File PDF wajib dipilih");
      return;
    }

    setSubmitting(true);

    let lampiranUrl = linkUrl;

    if (tipeLampiran === "pdf" && pdfFile) {
      setUploadingLabel("Mengunggah PDF...");
      const formData = new FormData();
      formData.append("file", pdfFile);

      const uploadRes = await fetch("/api/guru/upload", {
        method: "POST",
        body: formData,
      });

      setUploadingLabel(null);

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        setError(data.message ?? "Gagal mengunggah PDF");
        setSubmitting(false);
        return;
      }

      const uploadData = await uploadRes.json();
      lampiranUrl = uploadData.url;
    }

    const res = await fetch("/api/guru/materi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judul,
        deskripsi,
        mapel,
        kelas,
        tipeLampiran,
        lampiranUrl,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal mengunggah materi");
      return;
    }

    resetForm();
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus materi ini?")) return;
    await fetch(`/api/guru/materi/${id}`, { method: "DELETE" });
    loadData();
  }

  const tidakBisaUpload = mapelSaya.length === 0 || kelasSaya.length === 0;

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL GURU
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Upload Materi
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Unggah materi pembelajaran untuk kelas dan mapel yang kamu ampu.
          </p>
        </div>
      </section>

      {tidakBisaUpload && !loading && (
        <div className="mb-6 rounded-2xl border border-[#3d6687]/10 bg-[#4b7899]/10 px-4 py-3 text-sm text-[#3d6687]">
          Kamu belum di-assign ke mapel atau kelas apapun. Hubungi admin untuk di-assign dulu
          sebelum bisa mengunggah materi.
        </div>
      )}

      {!tidakBisaUpload && (
        <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-base font-bold text-[#1d3345]">Materi Baru</h2>
            <p className="text-sm text-[#1d3345]/55">
              Isi detail materi dan pilih jenis lampiran.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Judul Materi
              </label>
              <input
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misal: Ringkasan Bab 3 - Struktur Data"
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
                placeholder="Catatan tambahan tentang materi ini..."
                rows={3}
                className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
                Jenis Lampiran
              </label>
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipeLampiran("link")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    tipeLampiran === "link"
                      ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                      : "border-[#3d6687]/10 bg-[#f8fafb] text-[#1d3345]/65 hover:border-[#4b7899]/40"
                  }`}
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setTipeLampiran("pdf")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    tipeLampiran === "pdf"
                      ? "border-[#3d6687] bg-[#3d6687] text-white shadow-sm"
                      : "border-[#3d6687]/10 bg-[#f8fafb] text-[#1d3345]/65 hover:border-[#4b7899]/40"
                  }`}
                >
                  Upload PDF
                </button>
              </div>

              {tipeLampiran === "link" ? (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              ) : (
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-[#3d6687] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (uploadingLabel ?? "Menyimpan...") : "+ Upload Materi"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </form>
        </section>
      )}

      {/* Daftar Materi */}
      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Daftar Aktif</p>
            <h2 className="mt-1 text-lg font-bold text-[#1d3345]">Materi yang Kamu Unggah</h2>
          </div>
          <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
            {materiList.length} Materi
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
              <p className="text-sm text-[#1d3345]/50">Memuat materi...</p>
            </div>
          )}

          {!loading && materiList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#1d3345]/50">
                Belum ada materi yang kamu unggah.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {materiList.map((m) => (
              <div
                key={m._id}
                className="flex flex-col gap-3 rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#1d3345]">{m.judul}</h3>
                    <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                      {m.mapel}
                    </span>
                    <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                      {m.kelas}
                    </span>
                  </div>
                  {m.deskripsi && (
                    <p className="mb-1 text-sm text-[#1d3345]/60">{m.deskripsi}</p>
                  )}
                  <p className="text-xs text-[#1d3345]/50">
                    Diunggah: {new Date(m.createdAt).toLocaleDateString("id-ID", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={m.lampiranUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                  >
                    {m.tipeLampiran === "pdf" ? "Lihat PDF" : "Buka Link"}
                  </a>
                  <button
                    onClick={() => handleDelete(m._id)}
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