"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type Entitas = "siswa" | "guru";
type Filter = "semua" | "kelas" | "jurusan" | "tingkat" | "mapel" | "siswa" | "guru";

interface ExportOptions {
  siswa: { id: string; nama: string; kelas: string }[];
  guru: { id: string; nama: string }[];
  kelas: string[];
  jurusan: string[];
  tingkat: string[];
  mapel: string[];
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

export default function DataExportPanel({ roleLabel }: { roleLabel: string }) {
  const [options, setOptions] = useState<ExportOptions | null>(null);
  const [entitas, setEntitas] = useState<Entitas>("siswa");
  const [filter, setFilter] = useState<Filter>("semua");
  const [nilai, setNilai] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/laporan/data?options=1")
      .then(async (response) => {
        if (!response.ok) throw new Error("Pilihan data tidak dapat dimuat.");
        setOptions(await response.json());
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Terjadi kesalahan."))
      .finally(() => setLoading(false));
  }, []);

  const filters: Filter[] = entitas === "siswa"
    ? ["semua", "kelas", "jurusan", "siswa", "tingkat", "mapel"]
    : ["semua", "kelas", "jurusan", "guru", "tingkat", "mapel"];

  let values: { value: string; label: string }[] = [];
  if (options) {
    if (filter === "kelas") values = options.kelas.map((item) => ({ value: item, label: item }));
    if (filter === "jurusan") values = options.jurusan.map((item) => ({ value: item, label: item }));
    if (filter === "tingkat") values = options.tingkat.map((item) => ({ value: item, label: item }));
    if (filter === "mapel") values = options.mapel.map((item) => ({ value: item, label: item }));
    if (filter === "siswa") values = options.siswa.map((item) => ({ value: item.id, label: `${item.nama} (${item.kelas})` }));
    if (filter === "guru") values = options.guru.map((item) => ({ value: item.id, label: item.nama }));
  }

  async function download() {
    setDownloading(true);
    setError("");
    try {
      const params = new URLSearchParams({ entitas, filter });
      if (filter !== "semua") params.set("nilai", nilai);
      const response = await fetch(`/api/laporan/data?${params.toString()}`);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message ?? "File tidak dapat diunduh.");
      }
      const file = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = file;
      link.download = `data-${entitas}-${filter}.xlsx`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(file), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "File tidak dapat diunduh.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
          PORTAL {roleLabel.toUpperCase()}
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Unduh Data</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
          Ekspor data siswa atau guru ke file Excel sesuai pilihan filter.
        </p>
      </section>

      <section className="max-w-3xl rounded-[20px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#1d3345]">
            Jenis data
            <select
              value={entitas}
              onChange={(event) => {
                setEntitas(event.target.value as Entitas);
                setFilter("semua");
                setNilai("");
              }}
              className="mt-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 font-normal outline-none focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              <option value="siswa">Data siswa</option>
              <option value="guru">Data guru</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#1d3345]">
            Pilihan unduhan
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as Filter);
                setNilai("");
              }}
              className="mt-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 font-normal outline-none focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              {filters.map((item) => <option key={item} value={item}>{FILTER_LABELS[item]}</option>)}
            </select>
          </label>
          {filter !== "semua" && (
            <label className="block text-sm font-semibold text-[#1d3345] sm:col-span-2">
              {FILTER_LABELS[filter]}
              <select
                value={nilai}
                onChange={(event) => setNilai(event.target.value)}
                disabled={loading || values.length === 0}
                className="mt-2 w-full rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 font-normal outline-none focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10 disabled:opacity-60"
              >
                <option value="">{loading ? "Memuat pilihan..." : "Pilih..."}</option>
                {values.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={download}
            disabled={loading || downloading || (filter !== "semua" && !nilai)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3d6687] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#315570] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} aria-hidden="true" />
            {downloading ? "Menyiapkan file..." : "Unduh Excel"}
          </button>
          {loading && <span className="text-sm text-[#1d3345]/60">Memuat pilihan data...</span>}
          {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
        </div>
      </section>
    </main>
  );
}