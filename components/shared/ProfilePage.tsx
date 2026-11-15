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
  const fields = user
    ? [
        { label: "Nama", value: user.name },
        { label: "Email", value: user.email },
        ...(isSiswa ? [{ label: "Kelas", value: user.kelas }] : []),
      ]
    : [];

  return (
    <main className="min-h-full space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#FDF5F6]">
        Profil
      </h1>

      {loading ? (
        <p
          role="status"
          className="rounded-xl border border-[#E8E2E4] bg-white px-5 py-4 text-sm text-[#57534E] dark:border-[#38272E] dark:bg-[#2C1E24] dark:text-[#C5B6B9]"
        >
          Memuat data profil...
        </p>
      ) : error ? (
        <section
          role="alert"
          className="space-y-4 rounded-xl border border-[#FECDD3] bg-[#FFE4E6] p-5 dark:border-[#5C2B3C] dark:bg-[#3B1E28]"
        >
          <p className="text-sm font-medium text-mulberry-800 dark:text-[#FFAEC0]">
            Profil gagal dimuat. Periksa koneksi lalu coba lagi.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="min-h-11 rounded-lg bg-mulberry-700 px-4 text-sm font-semibold text-white transition hover:bg-mulberry-800 active:scale-[0.98]"
          >
            Coba lagi
          </button>
        </section>
      ) : !user ? (
        <section className="space-y-4 rounded-xl border border-[#E8E2E4] bg-white p-5 dark:border-[#38272E] dark:bg-[#2C1E24]">
          <p className="text-sm text-[#57534E] dark:text-[#C5B6B9]">
            Data profil belum tersedia untuk akun ini.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="min-h-11 rounded-lg bg-mulberry-700 px-4 text-sm font-semibold text-white transition hover:bg-mulberry-800 active:scale-[0.98]"
          >
            Muat ulang
          </button>
        </section>
      ) : (
        <section
          aria-label="Informasi akun"
          className="divide-y divide-[#E8E2E4] overflow-hidden rounded-xl border border-[#E8E2E4] bg-white dark:divide-[#38272E] dark:border-[#38272E] dark:bg-[#2C1E24]"
        >
          <dl>
            {fields.map(({ label, value }) => (
              <div
                key={label}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-4"
              >
                <dt className="text-sm font-medium text-[#57534E] dark:text-[#C5B6B9]">
                  {label}
                </dt>
                <dd className="min-w-0 break-words text-sm font-semibold text-[#1C1917] dark:text-[#FDF5F6]">
                  {value ?? "Belum tersedia"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}
