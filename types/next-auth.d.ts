import { Role, Jurusan } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      jurusan?: Jurusan;
      kelas?: string;
    };
  }

  interface User {
    role: Role;
    jurusan?: Jurusan;
    kelas?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    jurusan?: Jurusan;
    kelas?: string;
  }
}
