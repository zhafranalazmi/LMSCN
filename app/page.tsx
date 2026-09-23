import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div className="absolute inset-0 -z-10 bg-navy-900/50" />

      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display font-bold text-lg text-white">
          SMK Citra Negara
        </span>
        <Link
          href="/login"
          className="rounded-full bg-white text-navy-700 px-5 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Masuk
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <span className="uppercase tracking-widest text-xs text-white/80 font-semibold mb-3">
          Learning Management System
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight">
          Satu portal untuk seluruh proses belajar di Citra Negara
        </h1>
        <p className="mt-5 max-w-xl text-white/80">
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

      <footer className="text-center text-xs text-white/60 py-6">
        &copy; {new Date().getFullYear()} SMK Citra Negara
      </footer>
    </main>
  );
}