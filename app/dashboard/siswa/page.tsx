export default function SiswaDashboard() {
  const menu = [
    { title: "Materi", desc: "Lihat materi dari guru" },
    { title: "Tugas", desc: "Lihat & kumpulkan tugas" },
    { title: "Asesmen", desc: "Ikut kuis/ujian online" },
    { title: "Nilai", desc: "Lihat hasil penilaian" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Dashboard Siswa
      </h1>
      <p className="text-ink/60 mb-6">Akses materi, tugas, dan hasil belajar kamu.</p>

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
