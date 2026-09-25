"use client";

import { useEffect, useState } from "react";

interface Tugas {
  _id: string;
  judul: string;
  deskripsi: string;
  mapel: string;
  deadline: string;
  tipeLampiran: "link" | "pdf";
  lampiranUrl: string;
  sudahKumpul: boolean;
  nilai: number | null;
  statusPengumpulan: "belum_dinilai" | "sudah_dinilai" | null;
}

export default function TugasSiswaPage() {
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubmit, setActiveSubmit] = useState<string | null>(null);
  const [tipeKumpul, setTipeKumpul] = useState<"link" | "pdf">("link");
  const [linkUrl, setLinkUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/siswa/tugas");
    const data = await res.json();
    setTugasList(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function sudahLewatDeadline(deadline: string) {
    return new Date(deadline).getTime() < Date.now();
  }

  function openSubmit(id: string) {
    setActiveSubmit(id);
    setTipeKumpul("link");
    setLinkUrl("");
    setPdfFile(null);
    setError(null);
  }

  async function handleKumpul(tugasId: string) {
    setError(null);

    if (tipeKumpul === "link" && !linkUrl) {
      setError("Link wajib diisi");
      return;
    }
    if (tipeKumpul === "pdf" && !pdfFile) {
      setError("File PDF wajib dipilih");
      return;
    }

    setSubmitting(true);

    let lampiranUrl = linkUrl;

    if (tipeKumpul === "pdf" && pdfFile) {
      setUploadingLabel("Mengunggah PDF...");
      const formData = new FormData();
      formData.append("file", pdfFile);

      const uploadRes = await fetch("/api/guru/upload", {
        method: "POST",
        body: formData,
      });

      setUploadingLabel(null);

      if (!uploadRes.ok) {
        setError("Gagal mengunggah PDF");
        setSubmitting(false);
        return;
      }

      const uploadData = await uploadRes.json();
      lampiranUrl = uploadData.url;
    }

    const res = await fetch(`/api/siswa/tugas/${tugasId}/kumpul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipeLampiran: tipeKumpul, lampiranUrl }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Gagal mengumpulkan tugas");
      return;
    }

    setActiveSubmit(null);
    loadData();
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL SISWA
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Tugas
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Daftar tugas dari guru untuk kelas kamu.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
              <p className="text-sm text-[#1d3345]/50">Memuat tugas...</p>
            </div>
          )}

          {!loading && tugasList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#1d3345]/50">Belum ada tugas.</p>
            </div>
          )}

          <div className="space-y-3">
            {tugasList.map((t) => {
              const lewat = sudahLewatDeadline(t.deadline);
              return (
                <div key={t._id} className="rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#1d3345]">{t.judul}</h3>
                        <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                          {t.mapel}
                        </span>
                        {t.sudahKumpul ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              t.statusPengumpulan === "sudah_dinilai"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {t.statusPengumpulan === "sudah_dinilai"
                              ? `Nilai: ${t.nilai}`
                              : "Menunggu Penilaian"}
                          </span>
                        ) : lewat ? (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                            Lewat Deadline
                          </span>
                        ) : null}
                      </div>
                      {t.deskripsi && (
                        <p className="mb-1 text-sm text-[#1d3345]/60">{t.deskripsi}</p>
                      )}
                      <p className="text-xs text-[#1d3345]/50">
                        Deadline:{" "}
                        {new Date(t.deadline).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={t.lampiranUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                      >
                        {t.tipeLampiran === "pdf" ? "Lihat PDF" : "Buka Link"}
                      </a>
                      {!t.sudahKumpul && (
                        <button
                          type="button"
                          onClick={() => openSubmit(t._id)}
                          className="rounded-lg bg-[#3d6687] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2f5573]"
                        >
                          Kumpulkan
                        </button>
                      )}
                    </div>
                  </div>

                  {activeSubmit === t._id && (
                    <div className="mt-4 space-y-3 border-t border-[#3d6687]/10 pt-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTipeKumpul("link")}
                          className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                            tipeKumpul === "link"
                              ? "border-[#3d6687] bg-[#3d6687] text-white"
                              : "border-[#3d6687]/10 bg-white text-[#1d3345]/65"
                          }`}
                        >
                          Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipeKumpul("pdf")}
                          className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                            tipeKumpul === "pdf"
                              ? "border-[#3d6687] bg-[#3d6687] text-white"
                              : "border-[#3d6687]/10 bg-white text-[#1d3345]/65"
                          }`}
                        >
                          Upload PDF
                        </button>
                      </div>

                      {tipeKumpul === "link" ? (
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full rounded-xl border border-[#3d6687]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4b7899]"
                        />
                      ) : (
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                          className="w-full rounded-xl border border-[#3d6687]/15 bg-white px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#3d6687] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                        />
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleKumpul(t._id)}
                          disabled={submitting}
                          className="rounded-lg bg-[#3d6687] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2f5573] disabled:opacity-60"
                        >
                          {submitting ? (uploadingLabel ?? "Mengirim...") : "Kirim Tugas"}
                        </button>
                        <button
                          onClick={() => setActiveSubmit(null)}
                          className="rounded-lg px-4 py-2 text-xs font-bold text-[#1d3345]/60 hover:bg-[#1d3345]/5"
                        >
                          Batal
                        </button>
                      </div>

                      {error && <p className="text-xs text-red-600">{error}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}