"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type Filter = "semua" | "kelas" | "jurusan" | "tingkat" | "mapel" | "siswa" | "guru";

interface ExportOptions {
  siswa: { id: string; nama: string; kelas: string }[];
  guru: { id: string; nama: string }[];
  kelas: string[];
  jurusan: string[];
  tingkat: string[];
  mapel: string[];
}

interface NilaiRow {
  siswaName: string;
  siswaEmail: string;
  siswaJurusan: string;
  siswaKelas: string;
  tingkat: string;
  guruName: string;
  mapel: string;
  jenis: "Asesmen" | "Tugas";
  judul: string;
  nilai: number | null;
  status: string;
}

const FILTER_LABELS: Record<Filter, string> = {
  semua: "Keseluruhan",
  kelas: "Per kelas",
  jurusan: "Per jurusan",
  tingkat: "Per tingkat",
  mapel: "Per mata pelajaran",
  siswa: "Per siswa",
  guru: "Per guru",
};

export default function NilaiReportPanel({ roleLabel }: { roleLabel: string }) {
  const [options, setOptions] = useState<ExportOptions | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");
  const [nilaiFilter, setNilaiFilter] = useState("");
  const [rows, setRows] = useState<NilaiRow[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [sudahMuat, setSudahMuat] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/laporan/data?options=1")
      .then(async (response) => {
        if (!response.ok) throw new Error("Pilihan data tidak dapat dimuat.");
        setOptions(await response.json());
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Terjadi kesalahan."))
      .finally(() => setLoadingOptions(false));
  }, []);

  let values: { value: string; label: string }[] = [];
  if (options) {
    if (filter === "kelas") values = options.kelas.map((item) => ({ value: item, label: item }));
    if (filter === "jurusan") values = options.jurusan.map((item) => ({ value: item, label: item }));
    if (filter === "tingkat") values = options.tingkat.map((item) => ({ value: item, label: item }));
    if (filter === "mapel") values = options.mapel.map((item) => ({ value: item, label: item }));
    if (filter === "siswa") values = options.siswa.map((item) => ({ value: item.id, label: `${item.nama} (${item.kelas})` }));
    if (filter === "guru") values = options.guru.map((item) => ({ value: item.id, label: item.nama }));
  }

  async function loadRows() {
    setLoadingRows(true);
    setSudahMuat(true);
    setError("");
    try {
      const params = new URLSearchParams({ filter });
      if (filter !== "semua") params.set("nilai", nilaiFilter);
      const response = await fetch(`/api/laporan/nilai?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Rekap nilai tidak dapat dimuat.");
      setRows(Array.isArray(data) ? data : []);
    } catch (cause) {
      setRows([]);
      setError(cause instanceof Error ? cause.message : "Rekap nilai tidak dapat dimuat.");
    } finally {
      setLoadingRows(false);
    }
  }

  async function downloadRows() {
    setError("");
    try {
      const params = new URLSearchParams({ filter, format: "xlsx" });
      if (filter !== "semua") params.set("nilai", nilaiFilter);
      const response = await fetch(`/api/laporan/nilai?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "File tidak dapat diunduh.");
      }
      const file = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = file;
      link.download = `rekap-nilai-${filter}.xlsx`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(file), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "File tidak dapat diunduh.");
    }
  }

  const filterValid = filter === "semua" || !!nilaiFilter;

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
          PORTAL {roleLabel.toUpperCase()}
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Rekap Nilai</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
          Tinjau dan unduh nilai siswa berdasarkan kelas, jurusan, tingkat, mapel, guru, siswa, atau keseluruhan.
        </p>
      </section>

      <section className="mb-6 max-w-4xl rounded-[20px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(200px,0.8fr)_minmax(240px,1.2fr)]">
          <label className="block text-sm font-semibold text-[#1d3345]">
            Pilihan rekap
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as Filter);
                setNilaiFilter("");
                setRows([]);
                setSudahMuat(false);
              }}
              className="mt-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 font-normal outline-none focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              {(Object.keys(FILTER_LABELS) as Filter[]).map((item) => (
                <option key={item} value={item}>{FILTER_LABELS[item]}</option>
              ))}
            </select>
          </label>
          {filter !== "semua" && (
            <label className="block text-sm font-semibold text-[#1d3345]">
              {FILTER_LABELS[filter]}
              <select
                value={nilaiFilter}
                onChange={(event) => setNilaiFilter(event.target.value)}
                disabled={loadingOptions || values.length === 0}
                className="mt-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 font-normal outline-none focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10 disabled:opacity-60"
              >
                <option value="">{loadingOptions ? "Memuat pilihan..." : "Pilih..."}</option>
                {values.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadRows}
            disabled={!filterValid || loadingRows || loadingOptions}
            className="rounded-xl bg-[#3d6687] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#315570] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingRows ? "Memuat..." : "Muat Rekap"}
          </button>
          {sudahMuat && rows.length > 0 && (
            <button
              type="button"
              onClick={downloadRows}
              className="inline-flex items-center gap-2 rounded-xl border border-[#3d6687]/20 px-5 py-3 text-sm font-bold text-[#3d6687] transition hover:bg-[#3d6687]/5"
            >
              <Download size={17} aria-hidden="true" />
              Unduh Excel
            </button>
          )}
          {loadingOptions && <span className="text-sm text-[#1d3345]/60">Memuat pilihan data...</span>}
          {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
        </div>
      </section>

      {sudahMuat && (
        <section className="overflow-hidden rounded-[20px] border border-[#3d6687]/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#3d6687]/10 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-[#1d3345]">Hasil Rekap</h2>
            <span className="rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">{rows.length} Data</span>
          </div>
          {loadingRows ? (
            <p className="px-6 py-10 text-center text-sm text-[#1d3345]/60">Memuat nilai...</p>
          ) : rows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[#1d3345]/60">Belum ada nilai untuk pilihan ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nama Siswa</th>
                    <th className="px-4 py-3 font-bold">Kelas</th>
                    <th className="px-4 py-3 font-bold">Jurusan</th>
                    <th className="px-4 py-3 font-bold">Guru</th>
                    <th className="px-4 py-3 font-bold">Mapel</th>
                    <th className="px-4 py-3 font-bold">Jenis</th>
                    <th className="px-4 py-3 font-bold">Judul</th>
                    <th className="px-4 py-3 text-center font-bold">Nilai</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.siswaEmail}-${row.jenis}-${row.judul}-${index}`} className="border-t border-[#3d6687]/[0.08]">
                      <td className="px-4 py-3 font-semibold text-[#1d3345]">{row.siswaName}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.siswaKelas}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.siswaJurusan}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.guruName}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.mapel}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.jenis}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.judul}</td>
                      <td className="px-4 py-3 text-center font-bold text-[#3d6687]">{row.nilai ?? "-"}</td>
                      <td className="px-4 py-3 text-[#1d3345]/60">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}