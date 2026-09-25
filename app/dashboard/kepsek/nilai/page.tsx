"use client";

import { useEffect, useState } from "react";

interface GuruItem {
  _id: string;
  name: string;
  mapel: string[];
}

interface NilaiRow {
  siswaName: string;
  siswaEmail: string;
  jenis: "Asesmen" | "Tugas";
  judul: string;
  nilai: number | null;
  status: string;
}

function toCsv(rows: NilaiRow[]) {
  const header = ["Nama Siswa", "Email", "Jenis", "Judul", "Nilai", "Status"];
  const lines = rows.map((r) =>
    [r.siswaName, r.siswaEmail, r.jenis, r.judul, r.nilai ?? "-", r.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function DownloadNilaiKepsekPage() {
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [guruId, setGuruId] = useState("");
  const [mapel, setMapel] = useState("");
  const [rows, setRows] = useState<NilaiRow[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(true);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [sudahMuat, setSudahMuat] = useState(false);

  useEffect(() => {
    fetch("/api/laporan/guru")
      .then((res) => res.json())
      .then((data) => setGuruList(Array.isArray(data) ? data : []))
      .finally(() => setLoadingGuru(false));
  }, []);

  const guruTerpilih = guruList.find((g) => g._id === guruId);

  useEffect(() => {
    if (guruTerpilih && guruTerpilih.mapel.length > 0) {
      setMapel(guruTerpilih.mapel[0]);
    } else {
      setMapel("");
    }
  }, [guruId]);

  async function handleMuat() {
    if (!guruId || !mapel) return;
    setLoadingNilai(true);
    setSudahMuat(true);
    const res = await fetch(
      `/api/laporan/nilai?guru=${encodeURIComponent(guruId)}&mapel=${encodeURIComponent(mapel)}`
    );
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoadingNilai(false);
  }

  function handleDownload() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nilai-${guruTerpilih?.name ?? "guru"}-${mapel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL KEPALA SEKOLAH
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Download Nilai
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Pilih guru dan mapel untuk melihat & mengunduh rekap nilai.
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
              Guru
            </label>
            <select
              value={guruId}
              onChange={(e) => setGuruId(e.target.value)}
              disabled={loadingGuru}
              className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              <option value="">Pilih guru</option>
              {guruList.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#1d3345]/60">
              Mapel
            </label>
            <select
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              disabled={!guruTerpilih}
              className="rounded-xl border border-[#3d6687]/15 bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1d3345] outline-none transition focus:border-[#4b7899] focus:ring-4 focus:ring-[#4b7899]/10"
            >
              {(guruTerpilih?.mapel ?? []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleMuat}
            disabled={!guruId || !mapel || loadingNilai}
            className="rounded-xl bg-[#3d6687] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f5573] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingNilai ? "Memuat..." : "Muat Data"}
          </button>

          {sudahMuat && rows.length > 0 && (
            <button
              onClick={handleDownload}
              className="rounded-xl border border-[#3d6687]/15 px-6 py-3 text-sm font-bold text-[#3d6687] transition hover:border-[#3d6687]/35 hover:bg-[#3d6687]/5"
            >
              ⬇ Download CSV
            </button>
          )}
        </div>
      </section>

      {sudahMuat && (
        <section className="overflow-hidden rounded-[24px] border border-[#3d6687]/10 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#3d6687]/10 bg-gradient-to-r from-[#3d6687]/[0.07] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#3d6687]/60">Rekap</p>
              <h2 className="mt-1 text-lg font-bold text-[#1d3345]">
                {guruTerpilih?.name} · {mapel}
              </h2>
            </div>
            <span className="w-fit rounded-full bg-[#3d6687] px-3 py-1.5 text-xs font-bold text-white">
              {rows.length} Data
            </span>
          </div>

          <div className="p-5 sm:p-6">
            {loadingNilai && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#4b7899]/20 border-t-[#4b7899]" />
                <p className="text-sm text-[#1d3345]/50">Memuat nilai...</p>
              </div>
            )}

            {!loadingNilai && rows.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#3d6687]/20 bg-[#f8fafb] px-4 py-8 text-center">
                <p className="text-sm font-medium text-[#1d3345]/50">
                  Belum ada data nilai untuk kombinasi ini.
                </p>
              </div>
            )}

            {!loadingNilai && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="bg-[#c3c4c0]/20 text-left text-xs uppercase tracking-wider text-[#1d3345]/55">
                    <tr>
                      <th className="px-4 py-3 font-bold">Nama Siswa</th>
                      <th className="px-4 py-3 font-bold">Jenis</th>
                      <th className="px-4 py-3 font-bold">Judul</th>
                      <th className="px-4 py-3 font-bold text-center">Nilai</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={idx} className="border-t border-[#3d6687]/[0.08]">
                        <td className="px-4 py-3 font-semibold text-[#1d3345]">{r.siswaName}</td>
                        <td className="px-4 py-3 text-[#1d3345]/60">{r.jenis}</td>
                        <td className="px-4 py-3 text-[#1d3345]/60">{r.judul}</td>
                        <td className="px-4 py-3 text-center font-bold text-[#3d6687]">
                          {r.nilai ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-[#1d3345]/60">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}