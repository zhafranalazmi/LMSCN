import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  kepsek: "Kepala Sekolah",
  kurikulum: "Kurikulum",
  siswa: "Siswa",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink/10 bg-white">
        <div>
          <span className="font-display font-bold text-plum-700">
            LMS Citra Negara
          </span>
          <span className="ml-3 text-xs uppercase tracking-wide bg-brand-100 text-brand-700 rounded-full px-2 py-1">
            {ROLE_LABEL[role] ?? role}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink/70">{session.user.name}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-6 bg-brand-50">{children}</main>
    </div>
  );
}
