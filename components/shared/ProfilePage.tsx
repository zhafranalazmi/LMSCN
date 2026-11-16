"use client";

import { useEffect, useState } from "react";

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

function getInitials(name: string | null) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("id"))
      .join("") || "?"
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

  const isSiswa = user?.role === "siswa";

  return (
    <main className="min-h-full py-3 sm:py-6">
      <h1 className="sr-only">Profil</h1>
      <div className="mx-auto w-full max-w-md px-1 sm:px-0">
        {loading ? (
          <p
            role="status"
            className="rounded-xl border border-[#E8E2E4] bg-white px-5 py-4 text-sm text-[#57534E] dark:border-[#38272E] dark:bg-[#21191D] dark:text-[#C5B6B9]"
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
          <article className="overflow-hidden rounded-2xl border border-[#E8E2E4] bg-white dark:border-[#38272E] dark:bg-[#21191D]">
            <div
              aria-hidden="true"
              className="h-32 bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#B6516D] sm:h-36"
            />

            <div className="px-5 pb-6 sm:px-7">
              <div className="-mt-10 mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#881337] text-xl font-bold text-white dark:border-[#21191D]">
                {getInitials(user.name)}
              </div>
              <h2 className="break-words font-display text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#FDF5F6]">
                {user.name ?? "Nama belum tersedia"}
              </h2>

              <dl className="mt-5 divide-y divide-[#E8E2E4] rounded-xl border border-[#E8E2E4] dark:divide-[#38272E] dark:border-[#38272E]">
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center sm:gap-3">
                  <dt className="text-xs font-medium text-[#57534E] dark:text-[#C5B6B9]">
                    Email
                  </dt>
                  <dd className="min-w-0 break-all text-sm font-semibold text-[#1C1917] dark:text-[#FDF5F6]">
                    {user.email ?? "Belum tersedia"}
                  </dd>
                </div>
                {isSiswa && (
                  <div className="grid gap-1 px-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center sm:gap-3">
                    <dt className="text-xs font-medium text-[#57534E] dark:text-[#C5B6B9]">
                      Kelas
                    </dt>
                    <dd className="min-w-0 break-words text-sm font-semibold text-[#1C1917] dark:text-[#FDF5F6]">
                      {user.kelas ?? "Belum tersedia"}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
