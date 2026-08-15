"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah");
      return;
    }

    // Ambil session untuk tahu role, lalu redirect ke dashboard sesuai role
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role ?? "siswa";
    router.push(`/dashboard/${role}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-brand-100 p-8"
      >
        <h1 className="font-display text-2xl font-bold text-plum-700 mb-1">
          Masuk
        </h1>
        <p className="text-sm text-ink/60 mb-6">LMS SMK Citra Negara</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-ink mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 mb-4 outline-none focus:border-plum-500"
          placeholder="nama@citranegara.sch.id"
        />

        <label className="block text-sm font-medium text-ink mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 mb-6 outline-none focus:border-plum-500"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-plum-700 text-white py-2.5 font-medium hover:bg-plum-900 transition-colors disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
