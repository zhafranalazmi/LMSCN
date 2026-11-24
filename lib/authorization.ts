export type AppRole = "superadmin" | "admin" | "guru" | "siswa" | "kepsek" | "kurikulum";

export function canAccessRole(sessionRole: unknown, allowedRole: AppRole): boolean {
  return sessionRole === "superadmin" || sessionRole === allowedRole;
}
