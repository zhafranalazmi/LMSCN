"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowLeft, LogOut } from "lucide-react";

type SessionUser = {
  name: string | null;
  email: string | null;
  role: string | null;
  kelas: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function ProfileAvatarPlaceholder() {
  return (
    <svg
      viewBox="0 0 128 128"
      className="h-full w-full"
      role="img"
      aria-label="Placeholder foto profil"
    >
      <circle cx="64" cy="64" r="64" fill="#DFE5E7" className="dark:fill-[#38272E]" />
      <circle cx="64" cy="46" r="23" fill="#FFFFFF" className="dark:fill-[#D4C4C8]" />
      <path
        d="M24 116c0-28 18-38 40-38s40 10 40 38"
        fill="#FFFFFF"
        className="dark:fill-[#D4C4C8]"
      />
    </svg>
  );
}

const DASHBOARD_PATHS: Record<string, string> = {
  siswa: "/dashboard/siswa",
  guru: "/dashboard/guru",
  admin: "/dashboard/admin",
  kepsek: "/dashboard/kepsek",
  kurikulum: "/dashboard/kurikulum",
};

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

  const isSiswa = user?.role === "siswa";
  const dashboardHref = user ? DASHBOARD_PATHS[user.role ?? ""] : undefined;

  return (
    <main className="min-h-full py-2 sm:py-6">
      <div className="mx-auto w-full max-w-sm px-1 sm:px-0">
        {loading ? (
          <p
            role="status"
            className="rounded-[28px] border border-[#E8E2E4] bg-white p-5 text-sm text-[#57534E] dark:border-[#38272E] dark:bg-[#21191D] dark:text-[#C5B6B9]"
          >
            Memuat data profil...
          </p>
        ) : error ? (
          <section
            role="alert"
            className="space-y-4 rounded-xl border border-[#FECDD3] bg-[#FFE4E6] p-5 dark:border-[#5C2B3C] dark:bg-[#3B1E28]"
          >
            <p className="text-sm font-semibold text-mulberry-800 dark:text-[#FFAEC0]">
              Profil gagal dimuat. Periksa koneksi Anda lalu coba lagi.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((v) => v + 1)}
              className="min-h-11 rounded-lg bg-mulberry-700 px-5 text-sm font-semibold text-white transition hover:bg-mulberry-800 active:scale-[0.98]"
            >
              Coba lagi
            </button>
          </section>
        ) : !user ? (
          <section className="space-y-4 rounded-xl border border-[#E8E2E4] bg-white p-5 dark:border-[#38272E] dark:bg-[#21191D]">
            <p className="text-sm text-[#796E72] dark:text-[#C5B6B9]">
              Data profil belum tersedia untuk akun ini.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((v) => v + 1)}
              className="min-h-11 rounded-lg bg-mulberry-700 px-5 text-sm font-semibold text-white transition hover:bg-mulberry-800 active:scale-[0.98]"
            >
              Muat ulang
            </button>
          </section>
        ) : (
          <article className="overflow-hidden rounded-[28px] border border-[#E8E2E4] bg-white p-4 shadow-sm dark:border-[#38272E] dark:bg-[#21191D] sm:p-5">
            <div className="relative h-36 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#6A0A26] via-[#881337] to-[#BE185D] sm:h-40">
              <svg
                className="absolute inset-0 h-full w-full opacity-25"
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M-20 40C80 10 160 80 240 40S380 60 420 30"
                  fill="none"
                  stroke="white"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                <path
                  d="M-10 100C90 60 170 140 250 90S370 110 430 80"
                  fill="none"
                  stroke="white"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="relative z-10 mt-4 mb-4 flex items-end px-3 md:-mt-11">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#DFE5E7] shadow-md dark:border-[#21191D] dark:bg-[#38272E]">
                <ProfileAvatarPlaceholder />
              </div>
            </div>

            <div className="space-y-1 px-3">
              <h1 className="break-words font-display text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#FDF5F6]">
                {user.name ?? "Nama belum tersedia"}
              </h1>
            </div>

            <dl className="mt-5 divide-y divide-[#E8E2E4] rounded-2xl border border-[#E8E2E4] bg-[#FAF7F8] dark:divide-[#38272E] dark:border-[#38272E] dark:bg-[#2C1E24]">
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center sm:gap-3">
                <dt className="text-xs font-medium text-[#57534E] dark:text-[#C5B6B9]">
                  Email
                </dt>
                <dd className="min-w-0 break-all text-sm font-semibold text-[#1C1917] dark:text-[#FDF5F6]">
                  {user.email ?? "Belum tersedia"}
                </dd>
              </div>
              {isSiswa && (
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center sm:gap-3">
                  <dt className="text-xs font-medium text-[#57534E] dark:text-[#C5B6B9]">
                    Kelas
                  </dt>
                  <dd className="min-w-0 break-words text-sm font-semibold text-[#1C1917] dark:text-[#FDF5F6]">
                    {user.kelas ?? "Belum tersedia"}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex items-center gap-2">
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1C1917] px-4 text-sm font-bold text-white transition hover:bg-mulberry-800 active:scale-[0.99] dark:bg-[#FDF5F6] dark:text-[#1C1917] dark:hover:bg-white"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Kembali ke Ringkasan</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Keluar dari akun"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8E2E4] bg-white text-[#57534E] transition hover:border-[#FECDD3] hover:bg-[#FFF5F7] hover:text-mulberry-800 active:scale-[0.95] dark:border-[#38272E] dark:bg-[#2C1E24] dark:text-[#C5B6B9] dark:hover:bg-[#3B1E28] dark:hover:text-[#FFAEC0]"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
