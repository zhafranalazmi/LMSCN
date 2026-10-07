export interface PengajaranGuru {
  mapel: string;
  kelas: string[];
}

interface GuruDenganPengajaran {
  pengajaran?: unknown;
  mapel?: string[];
  kelasDiampu?: string[];
}

export function getPengajaranGuru(guru: GuruDenganPengajaran): PengajaranGuru[] {
  if (Array.isArray(guru.pengajaran)) {
    return guru.pengajaran
      .filter(
        (item): item is { mapel: string; kelas: string[] } =>
          !!item && typeof item.mapel === "string" && Array.isArray(item.kelas)
      )
      .map(({ mapel, kelas }) => ({ mapel, kelas }));
  }

  const kelasLama = guru.kelasDiampu ?? [];
  return (guru.mapel ?? []).map((mapel) => ({ mapel, kelas: kelasLama }));
}

export function normalisasiPengajaranGuru(
  pengajaran: unknown,
  mapelLama: string[] = [],
  kelasLama: string[] = []
): PengajaranGuru[] {
  const daftar = Array.isArray(pengajaran)
    ? pengajaran
    : mapelLama.map((mapel) => ({ mapel, kelas: kelasLama }));
  const hasil = new Map<string, Set<string>>();

  for (const item of daftar) {
    if (!item || typeof item.mapel !== "string" || !Array.isArray(item.kelas)) continue;
    const mapel = item.mapel.trim();
    if (!mapel) continue;
    if (!hasil.has(mapel)) hasil.set(mapel, new Set());
    for (const kelas of item.kelas) {
      if (typeof kelas === "string" && kelas.trim()) hasil.get(mapel)!.add(kelas.trim());
    }
  }

  return [...hasil].map(([mapel, kelas]) => ({ mapel, kelas: [...kelas] }));
}

export function guruMengajar(
  guru: GuruDenganPengajaran,
  mapel: string,
  kelas: string
) {
  return getPengajaranGuru(guru).some(
    (item) => item.mapel === mapel && item.kelas.includes(kelas)
  );
}

export function daftarKelasPengajaran(guru: GuruDenganPengajaran) {
  return [...new Set(getPengajaranGuru(guru).flatMap((item) => item.kelas))];
}
