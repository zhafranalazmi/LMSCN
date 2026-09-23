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
}

export default function TugasSiswaPage() {
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/siswa/tugas")
      .then((res) => res.json())
      .then((data) => setTugasList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  function sudahLewatDeadline(deadline: string) {
    return new Date(deadline).getTime() < Date.now();
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
                <div
                  key={t._id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#3d6687]/10 bg-[#f8fafb] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#1d3345]">{t.judul}</h3>
                      <span className="rounded-full bg-[#4b7899]/10 px-2.5 py-0.5 text-xs font-bold text-[#3d6687]">
                        {t.mapel}
                      </span>
                      {lewat && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                          Lewat Deadline
                        </span>
                      )}
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

                  <a
                    href={t.lampiranUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#3d6687]/15 px-3 py-2 text-xs font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
                  >
                    {t.tipeLampiran === "pdf" ? "Lihat PDF" : "Buka Link"}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}