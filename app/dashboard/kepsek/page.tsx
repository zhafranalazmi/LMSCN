import Link from "next/link";

export default function KepsekDashboard() {
  const menu = [
    { title: "Lihat Guru", desc: "Lihat daftar guru dan aktivitasnya", icon: "👩‍🏫", href: "/dashboard/kepsek/guru" },
    { title: "Download Nilai", desc: "Unduh rekap nilai per mapel & guru", icon: "📊", href: "/dashboard/kepsek/nilai" },
  ];

  return (
    <main className="min-h-full rounded-[28px] bg-[#f5f6f6] p-4 sm:p-6 lg:p-8">
      <section className="mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3d6687] via-[#4b7899] to-[#5b87a6] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
            PORTAL KEPALA SEKOLAH
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Kepala Sekolah
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Pantau aktivitas guru dan unduh rekap nilai.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => (
          <Link key={item.title} href={item.href}>
            <div className="flex items-start gap-4 rounded-[24px] border border-[#3d6687]/10 bg-white p-5 shadow-sm transition hover:border-[#4b7899]/30 hover:shadow-md h-full">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4b7899]/10 text-lg">
                {item.icon}
              </span>
              <div>
                <h2 className="font-bold text-[#1d3345] mb-1">{item.title}</h2>
                <p className="text-sm text-[#1d3345]/55">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}