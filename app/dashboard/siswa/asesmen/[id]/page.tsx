"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
        if (data) {
          setAsesmen(data);
          setWaktuMulai(Date.now());
          setSisaDetik(data.durasiMenit * 60);
        }
      })
      .finally(() => setLoading(false));
  }, [asesmenId]);

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
    if (sisaDetik <= 0 && waktuMulai) {
      handleSubmit();
      return;
    }
    if (!waktuMulai) return;
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
      <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
        <div className="rounded-[24px] border border-[#3d6687]/10 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
          <p className="text-sm font-medium text-[#1d3345]/50">Memuat soal...</p>
        </div>
      </main>
    );
  }

  if (errorAwal || !asesmen) {
    return (
      <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-red-600">{errorAwal ?? "Asesmen tidak ditemukan"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      {/* Header + Timer */}
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
              SEDANG DIKERJAKAN
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {asesmen.judul}
            </h1>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Sisa Waktu</p>
            <p className="font-display text-2xl font-bold">{formatWaktu(sisaDetik)}</p>
          </div>
        </div>
      </section>

      {/* Soal */}
      <div className="space-y-4">
        {asesmen.soal.map((s, index) => (
          <section
            key={s._id}
            className="rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-[#4b7899]/10 px-3 py-1 text-xs font-bold text-[#3d6687]">
                Soal {index + 1} · {s.poin} poin
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
  );
}