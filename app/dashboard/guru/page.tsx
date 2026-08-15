export default function GuruDashboard() {
  const menu = [
    { title: "Kelas Saya", desc: "Lihat siswa per kelas yang diampu" },
    { title: "Buat Tugas", desc: "Buat tugas baru (PDF/link)" },
    { title: "Upload Materi", desc: "Unggah materi pembelajaran" },
    { title: "Asesmen", desc: "Buat kuis/ujian online & beri penilaian" },
    { title: "Generate Nilai", desc: "Rekap nilai per mapel/kelas" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Dashboard Guru
      </h1>
      <p className="text-ink/60 mb-6">Kelola kelas, materi, tugas, dan penilaian.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl border border-ink/10 p-5 hover:border-brand-300 transition-colors"
          >
            <h2 className="font-semibold text-plum-700 mb-1">{item.title}</h2>
            <p className="text-sm text-ink/60">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
