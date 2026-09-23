import Link from "next/link";

export default function GuruDashboard() {
  const menu = [
    { title: "Kelas Saya", desc: "Lihat siswa per kelas yang diampu", icon: "🏫", href: "/dashboard/guru/kelas" },
    { title: "Buat Tugas", desc: "Buat tugas baru (PDF/link)", icon: "📝", href: "/dashboard/guru/tugas" },
    { title: "Upload Materi", desc: "Unggah materi pembelajaran", icon: "📚", href: "/dashboard/guru/materi" },
    { title: "Asesmen", desc: "Buat kuis/ujian online & beri penilaian", icon: "🧪", href: "/dashboard/guru/asesmen" },
   { title: "Generate Nilai", desc: "Rekap nilai per mapel/kelas", icon: "📊", href: "/dashboard/guru/nilai" },
   { title: "Log Out", desc: "Keluar dari akun guru", icon: "🚪", href: "/login" },
  ];

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL GURU
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Guru
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Kelola kelas, materi, tugas, dan penilaian dari satu tempat.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => {
          const card = (
            <div className="flex items-start gap-4 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm transition hover:border-[#4b7899]/30 hover:shadow-md h-full">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4b7899]/10 text-lg">
                {item.icon}
              </span>
              <div>
                <h2 className="font-bold text-[#1d3345] mb-1">{item.title}</h2>
                <p className="text-sm text-[#1d3345]/55">{item.desc}</p>
                {!item.href && (
                  <span className="inline-block mt-2 text-xs font-medium text-[#3d6687] bg-[#4b7899]/10 rounded-full px-2 py-0.5">
                    Segera hadir
                  </span>
                )}
              </div>
            </div>
          );

          return item.href ? (
            <Link key={item.title} href={item.href}>
              {card}
            </Link>
          ) : (
            <div key={item.title}>{card}</div>
          );
        })}
      </section>
    </main>
  );
}