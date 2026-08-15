import Link from "next/link";

export default function AdminDashboard() {
  const menu = [
    {
      title: "Manajemen Kelas",
      desc: "Kelola daftar kelas per jurusan & tingkat",
      href: "/dashboard/admin/kelas",
    },
    {
      title: "Manajemen Siswa",
      desc: "Kelola data & akun siswa",
      href: "/dashboard/admin/siswa",
    },
    {
      title: "Manajemen Guru & Pelajaran",
      desc: "Kelola data guru, mata pelajaran, dan wali kelas",
      href: "/dashboard/admin/guru",
    },
    {
      title: "Manajemen Mata Pelajaran",
      desc: "Tambah dan kelola daftar mata pelajaran",
      href: "/dashboard/admin/mapel",
    },
    {
      title: "Akun Kepsek & Kurikulum",
      desc: "Kelola akun untuk Kepala Sekolah dan Kurikulum",
      href: "/dashboard/admin/akun",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Dashboard Admin
      </h1>
      <p className="text-ink/60 mb-6">Kelola akun, kelas, guru, dan data sekolah.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => {
          const card = (
            <div className="bg-white rounded-xl border border-ink/10 p-5 hover:border-brand-300 transition-colors h-full">
              <h2 className="font-semibold text-plum-700 mb-1">{item.title}</h2>
              <p className="text-sm text-ink/60">{item.desc}</p>
              {!item.href && (
                <span className="inline-block mt-2 text-xs text-ink/40">
                  Segera hadir
                </span>
              )}
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
      </div>
    </div>
  );
}
