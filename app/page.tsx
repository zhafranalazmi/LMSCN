import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display font-bold text-lg text-navy-700">
          SMK Citra Negara
        </span>
        <Link
          href="/login"
          className="rounded-full bg-navy-700 text-white px-5 py-2 text-sm font-medium hover:bg-navy-900 transition-colors"
        >
          Masuk
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <span className="uppercase tracking-widest text-xs text-navy-700 font-semibold mb-3">
          Learning Management System
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-ink max-w-3xl leading-tight">
          Satu portal untuk seluruh proses belajar di Citra Negara
        </h1>
        <p className="mt-5 max-w-xl text-ink/70">
          Materi, tugas, dan penilaian untuk siswa, guru, dan manajemen sekolah —
          dari jurusan PPLG sampai Perhotelan — dalam satu tempat.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-full bg-navy-500 text-white px-8 py-3 font-medium hover:bg-navy-700 transition-colors"
        >
          Masuk ke akun kamu
        </Link>
      </section>

      <footer className="text-center text-xs text-ink/50 py-6">
        &copy; {new Date().getFullYear()} SMK Citra Negara
      </footer>
    </main>
  );
}