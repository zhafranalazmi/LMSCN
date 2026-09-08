export default function KepsekDashboard() {
  const menu = [
    { title: "Daftar Guru", desc: "Lihat guru & aktivitas mengajar (tugas/ujian)" },
    { title: "Download Nilai", desc: "Unduh nilai per mapel & guru" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Dashboard Kepala Sekolah
      </h1>
      <p className="text-ink/60 mb-6">Pantau aktivitas guru dan unduh nilai.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => (
          <div
            key={item.title}
            className="bg-navy-100 rounded-xl border border-ink/10 p-5 hover:border-navy-300 transition-colors"
          >
            <h2 className="font-semibold text-navy-700 mb-1">{item.title}</h2>
            <p className="text-sm text-ink/60">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
