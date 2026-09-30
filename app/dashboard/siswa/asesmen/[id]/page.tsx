"use client";

import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";

interface Soal {
  _id: string;
  tipe: "pg" | "esai";
  pertanyaan: string;
  pilihan: string[];
  poin: number;
}

interface Asesmen {
  _id: string;
  judul: string;
  durasiMenit: number;
  soal: Soal[];
}

// Menutupi seluruh layout dashboard (sidebar + navbar)
function LayarPenuh({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f5f6f6]">
      {children}
    </div>
  );
}

export default function KerjakanAsesmenPage() {
  const params = useParams();
  const router = useRouter();
  const asesmenId = params.id as string;

  const [asesmen, setAsesmen] = useState<Asesmen | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorAwal, setErrorAwal] = useState<string | null>(null);
  const [jawaban, setJawaban] = useState<Record<string, { jawabanPg?: number; jawabanEsai?: string }>>({});
  const [waktuMulai, setWaktuMulai] = useState<number | null>(null);
  const [sisaDetik, setSisaDetik] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [keluarFullscreen, setKeluarFullscreen] = useState(false);
  const sudahSubmit = useRef(false);

  useEffect(() => {
    fetch(`/api/siswa/asesmen/${asesmenId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setErrorAwal(data.message ?? "Gagal memuat asesmen");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setAsesmen(data); // timer BELUM mulai di sini
      })
      .finally(() => setLoading(false));
  }, [asesmenId]);

  async function mulaiUjian() {
    if (!asesmen) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // fullscreen ditolak/tidak didukung, ujian tetap jalan
    }
    setWaktuMulai(Date.now());
    setSisaDetik(asesmen.durasiMenit * 60);
  }

  // Pantau keluar/masuk fullscreen
  useEffect(() => {
    const handler = () => setKeluarFullscreen(!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keluar fullscreen saat halaman ditinggalkan
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (sudahSubmit.current || !asesmen || !waktuMulai) return;
    sudahSubmit.current = true;
    setSubmitting(true);

    const jawabanArray = asesmen.soal.map((s) => ({
      soalId: s._id,
      tipe: s.tipe,
      jawabanPg: jawaban[s._id]?.jawabanPg ?? null,
      jawabanEsai: jawaban[s._id]?.jawabanEsai ?? "",
    }));

    const res = await fetch(`/api/siswa/asesmen/${asesmenId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jawaban: jawabanArray, waktuMulai: new Date(waktuMulai).toISOString() }),
    });

    setSubmitting(false);

    if (res.ok) {
      router.push("/dashboard/siswa/asesmen");
    } else {
      sudahSubmit.current = false;
      const data = await res.json();
      alert(data.message ?? "Gagal mengumpulkan jawaban");
    }
  }, [asesmen, waktuMulai, jawaban, asesmenId, router]);

  useEffect(() => {
    if (!waktuMulai) return;
    if (sisaDetik <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setSisaDetik((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [sisaDetik, waktuMulai, handleSubmit]);

  function formatWaktu(detik: number) {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <LayarPenuh>
        <main className="flex min-h-full items-center justify-center p-4">
          <div className="rounded-[24px] border border-[#3d6687]/10 bg-white px-10 py-14 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
            <p className="text-sm font-medium text-[#1d3345]/50">Memuat soal...</p>
          </div>
        </main>
      </LayarPenuh>
    );
  }

  if (errorAwal || !asesmen) {
    return (
      <LayarPenuh>
        <main className="flex min-h-full items-center justify-center p-4">
          <div className="max-w-md rounded-[24px] border border-red-200 bg-red-50 px-8 py-12 text-center">
            <p className="mb-4 text-sm font-medium text-red-600">
              {errorAwal ?? "Asesmen tidak ditemukan"}
            </p>
            <button
              onClick={() => router.push("/dashboard/siswa/asesmen")}
              className="rounded-xl bg-[#3d6687] px-5 py-2.5 text-sm font-bold text-white"
            >
              Kembali
            </button>
          </div>
        </main>
      </LayarPenuh>
    );
  }

  // Layar sebelum ujian dimulai
  if (!waktuMulai) {
    return (
      <LayarPenuh>
        <main className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[24px] border border-[#3d6687]/10 bg-white p-8 text-center shadow-sm">
            <span className="mb-3 inline-flex rounded-full bg-[#4b7899]/10 px-3 py-1 text-xs font-bold tracking-wider text-[#3d6687]">
              SIAP MENGERJAKAN
            </span>
            <h1 className="mb-2 font-display text-2xl font-bold text-[#1d3345]">
              {asesmen.judul}
            </h1>
            <p className="mb-6 text-sm text-[#1d3345]/60">
              {asesmen.soal.length} soal · {asesmen.durasiMenit} menit. Ujian akan tampil
              dalam layar penuh dan waktu mulai berjalan setelah kamu menekan tombol di bawah.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard/siswa/asesmen")}
                className="flex-1 rounded-xl border border-[#3d6687]/15 px-5 py-3 text-sm font-bold text-[#3d6687] hover:bg-[#3d6687]/5"
              >
                Kembali
              </button>
              <button
                onClick={mulaiUjian}
                className="flex-1 rounded-xl bg-[#3d6687] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] active:scale-[0.98]"
              >
                Mulai Ujian
              </button>
            </div>
          </div>
        </main>
      </LayarPenuh>
    );
  }

  return (
    <LayarPenuh>
      {/* Bar atas: judul + timer, tetap terlihat saat scroll */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-4 py-3 text-white shadow-lg sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Sedang dikerjakan
            </p>
            <h1 className="truncate font-display text-base font-bold sm:text-lg">
              {asesmen.judul}
            </h1>
          </div>
          <div className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Sisa Waktu
            </p>
            <p
              className={`font-display text-xl font-bold ${
                sisaDetik <= 60 ? "text-red-200" : ""
              }`}
            >
              {formatWaktu(sisaDetik)}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {keluarFullscreen && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>Kamu keluar dari mode layar penuh.</span>
            <button
              onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              Kembali ke Layar Penuh
            </button>
          </div>
        )}

        {/* Soal */}
        <div className="space-y-4">
          {asesmen.soal.map((s, index) => (
            <section
              key={s._id}
              className="rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[#4b7899]/10 px-3 py-1 text-xs font-bold text-[#3d6687]">
                  Soal {index + 1}
                </span>
              </div>
              <p className="mb-4 font-semibold text-[#1d3345]">{s.pertanyaan}</p>

              {s.tipe === "pg" ? (
                <div className="space-y-2">
                  {s.pilihan.map((p, pi) => (
                    <label
                      key={pi}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        jawaban[s._id]?.jawabanPg === pi
                          ? "border-[#3d6687] bg-[#3d6687]/5"
                          : "border-[#3d6687]/10 bg-[#f8fafb] hover:border-[#4b7899]/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`soal-${s._id}`}
                        checked={jawaban[s._id]?.jawabanPg === pi}
                        onChange={() =>
                          setJawaban((prev) => ({ ...prev, [s._id]: { jawabanPg: pi } }))
                        }
                        className="h-4 w-4 accent-[#3d6687]"
                      />
                      <span className="text-[#1d3345]">{p}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={jawaban[s._id]?.jawabanEsai ?? ""}
                  onChange={(e) =>
                    setJawaban((prev) => ({ ...prev, [s._id]: { jawabanEsai: e.target.value } }))
                  }
                  placeholder="Tulis jawaban kamu..."
                  rows={4}
                  className="w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
                />
              )}
            </section>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-4 w-full rounded-xl bg-[#3d6687] px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Mengumpulkan..." : "Kumpulkan Jawaban"}
        </button>
      </main>
    </LayarPenuh>
  );
}