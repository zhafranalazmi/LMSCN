"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowLeft, CheckCircle2, GraduationCap, LogOut, Mail, School, Shield, User } from "lucide-react";

type SessionUser = {
  name: string | null;
  email: string | null;
  role: string | null;
  kelas: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru Pengampu",
  admin: "Administrator",
  kepsek: "Kepala Sekolah",
  kurikulum: "Wakil Kurikulum",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

// Avatar default bergaya WhatsApp (siluet abu-abu/putih minimalis)
function WhatsAppDefaultAvatar() {
  return (
    <svg
      viewBox="0 0 128 128"
      className="h-full w-full select-none"
      aria-label="Foto profil default"
      role="img"
    >
      {/* Background bulat netral khas WA */}
      <circle cx="64" cy="64" r="64" fill="#DFE5E7" className="dark:fill-[#38272E]" />
      {/* Siluet Kepala */}
      <circle cx="64" cy="46" r="23" fill="#FFFFFF" className="dark:fill-[#C5B6B9]" />
      {/* Siluet Bahu / Tubuh */}
      <path
        d="M 24 116 C 24 88 42 78 64 78 C 86 78 104 88 104 116 Z"
        fill="#FFFFFF"
        className="dark:fill-[#C5B6B9]"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Gagal memuat data profil.");
        }

        const data: unknown = await response.json();
        const sessionUser =
          isRecord(data) && isRecord(data.user) ? data.user : null;

        if (active) {
          setUser(
            sessionUser
              ? {
                  name: getOptionalString(sessionUser.name),
                  email: getOptionalString(sessionUser.email),
                  role: getOptionalString(sessionUser.role),
                  kelas: getOptionalString(sessionUser.kelas),
                }
              : null
          );
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [attempt]);

  const role = user?.role ?? "siswa";
  const roleLabel = ROLE_LABEL[role] ?? role;
  const isSiswa = role === "siswa";
  const dashboardHref = `/dashboard/${role}`;

  return (
    <main className="min-h-full py-2 sm:py-6">
      <div className="mx-auto w-full max-w-sm sm:max-w-md">
        {loading ? (
          <div className="rounded-[28px] border border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#21191D] p-5 shadow-sm space-y-4 animate-pulse">
            <div className="h-40 rounded-2xl bg-[#E8E2E4] dark:bg-[#38272E]" />
            <div className="h-16 w-16 -mt-10 rounded-full bg-[#DDD7CD] dark:bg-[#4E343D]" />
            <div className="h-6 w-3/4 rounded bg-[#E8E2E4] dark:bg-[#38272E]" />
            <div className="h-4 w-1/2 rounded bg-[#E8E2E4] dark:bg-[#38272E]" />
          </div>
        ) : error ? (
          <section
            role="alert"
            className="rounded-[28px] border border-[#FECDD3] bg-[#FFE4E6] p-6 dark:border-[#5C2B3C] dark:bg-[#3B1E28] space-y-4 text-center"
          >
            <p className="text-sm font-semibold text-mulberry-800 dark:text-[#FFAEC0]">
              Profil gagal dimuat. Periksa koneksi Anda lalu coba lagi.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((v) => v + 1)}
              className="rounded-xl bg-mulberry-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-mulberry-800"
            >
              Coba Lagi
            </button>
          </section>
        ) : !user ? (
          <section className="rounded-[28px] border border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#21191D] p-6 text-center space-y-4">
            <p className="text-sm text-[#796E72] dark:text-[#C5B6B9]">
              Data profil belum tersedia.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((v) => v + 1)}
              className="rounded-xl bg-mulberry-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-mulberry-800"
            >
              Muat Ulang
            </button>
          </section>
        ) : (
          /* ====================================================================
             KARTU PROFIL (Sesuai Konsep Referensi Foto)
             - Header Banner Bergradasi Mulberry Wine & Stone
             - Foto Profil Default WA bulat overlap di perbatasan banner
             - Badge Sekolah di pojok kanan banner
             - Nama, Email, dan Kelas
             - 3 Kolom Info Pill (Peran, Kelas/Status, Tahun Ajaran)
             - Tombol Navigasi Utama + Tombol Keluar di Bawah
             ==================================================================== */
          <div className="overflow-hidden rounded-[28px] border border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#21191D] p-4 sm:p-5 shadow-sm transition-colors">
            {/* 1. Header Banner dengan Gradient Mulberry Wine & Stone */}
            <div className="relative h-36 sm:h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-tr from-[#6A0A26] via-[#881337] to-[#BE185D] dark:from-[#3B0E1E] dark:via-[#5C162E] dark:to-[#881337] shadow-inner">
              {/* Gelombang kontur dekoratif lembut */}
              <svg
                className="absolute inset-0 h-full w-full opacity-25"
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M-20 40 C 80 10 160 80 240 40 C 320 0 380 60 420 30"
                  fill="none"
                  stroke="white"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                <path
                  d="M-10 100 C 90 60 170 140 250 90 C 330 40 370 110 430 80"
                  fill="none"
                  stroke="white"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </svg>

              {/* Badge Lembaga di pojok kanan atas banner */}
              <div className="absolute right-3.5 top-3.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs shadow-xs">
                  <School size={13} aria-hidden="true" />
                  SMK Citra Negara
                </span>
              </div>
            </div>

            {/* 2. Baris Avatar Overlap & Badge Identitas */}
            <div className="relative -mt-11 sm:-mt-12 mb-4 flex items-end justify-between px-3">
              {/* Foto Profil Default WhatsApp (Bulat timbul dengan border tebal) */}
              <div className="relative flex h-22 w-22 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-[#21191D] shadow-md bg-[#DFE5E7] dark:bg-[#38272E]">
                <WhatsAppDefaultAvatar />
              </div>

              {/* Status Badge di kanan bawah banner */}
              <div className="mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FECDD3] dark:border-[#5C2B3C] bg-[#FFF5F7] dark:bg-[#2C1E24] px-3.5 py-1 text-xs font-bold text-mulberry-800 dark:text-[#FFAEC0] shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-mulberry-700 dark:bg-rose-500 animate-pulse" />
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* 3. Identitas Pengguna (Nama & Email) */}
            <div className="space-y-1 px-3">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#FDF5F6]">
                {user.name ?? "Pengguna"}
              </h1>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#796E72] dark:text-[#C5B6B9]">
                <Mail size={13} aria-hidden="true" className="shrink-0 text-mulberry-700 dark:text-[#FFAEC0]" />
                <span className="truncate">{user.email ?? "Email tidak tersedia"}</span>
              </div>
              <p className="pt-2 text-xs leading-relaxed text-[#57534E] dark:text-[#C5B6B9]">
                {isSiswa
                  ? `Siswa aktif kelas ${user.kelas ?? "—"} terdaftar pada sistem pembelajaran daring SMK Citra Negara.`
                  : `Akun resmi ${roleLabel} pada portal LMS SMK Citra Negara.`}
              </p>
            </div>

            {/* 4. Tiga Kolom Info Pill (Persis seperti Rating / Hours / Months pada gambar) */}
            <div className="mt-5 rounded-2xl border border-[#E8E2E4] dark:border-[#38272E] bg-[#FAF7F8] dark:bg-[#2C1E24] p-3 shadow-2xs">
              <div className="grid grid-cols-3 divide-x divide-[#E8E2E4] dark:divide-[#38272E] text-center">
                {/* Kolom 1: Peran */}
                <div className="px-1">
                  <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#796E72] dark:text-[#A8989C]">
                    <User size={11} className="text-mulberry-700 dark:text-[#FFAEC0]" />
                    Peran
                  </p>
                  <p className="mt-1 font-display text-xs sm:text-sm font-bold text-[#1C1917] dark:text-[#FDF5F6] truncate">
                    {role === "siswa" ? "Siswa" : role === "guru" ? "Guru" : roleLabel}
                  </p>
                </div>

                {/* Kolom 2: Kelas (bila siswa) atau Status */}
                <div className="px-1">
                  <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#796E72] dark:text-[#A8989C]">
                    <GraduationCap size={11} className="text-mulberry-700 dark:text-[#FFAEC0]" />
                    {isSiswa ? "Kelas" : "Status"}
                  </p>
                  <p className="mt-1 font-display text-xs sm:text-sm font-bold text-[#1C1917] dark:text-[#FDF5F6] truncate">
                    {isSiswa ? user.kelas ?? "—" : "Aktif"}
                  </p>
                </div>

                {/* Kolom 3: Semester / Tahun */}
                <div className="px-1">
                  <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#796E72] dark:text-[#A8989C]">
                    <CheckCircle2 size={11} className="text-mulberry-700 dark:text-[#FFAEC0]" />
                    T.A.
                  </p>
                  <p className="mt-1 font-display text-xs sm:text-sm font-bold text-[#1C1917] dark:text-[#FDF5F6] truncate">
                    2026/2027
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Tombol Aksi di Bawah (Persis tombol lebar + tombol kotak di gambar) */}
            <div className="mt-5 flex items-center gap-2.5">
              {/* Tombol Utama: Kembali ke Ringkasan */}
              <Link
                href={dashboardHref}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1C1917] dark:bg-[#FDF5F6] px-4 py-3 text-xs sm:text-sm font-bold text-white dark:text-[#1C1917] shadow-xs transition hover:bg-mulberry-800 dark:hover:bg-white active:scale-[0.99]"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Kembali ke Ringkasan</span>
              </Link>

              {/* Tombol Kotak Samping: Keluar / Log Out */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Keluar dari akun"
                title="Keluar dari akun"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8E2E4] dark:border-[#38272E] bg-white dark:bg-[#2C1E24] text-[#796E72] dark:text-[#C5B6B9] shadow-xs transition hover:border-[#FECDD3] hover:bg-[#FFF5F7] hover:text-mulberry-800 dark:hover:bg-[#3B1E28] dark:hover:text-[#FFAEC0] active:scale-[0.95]"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
