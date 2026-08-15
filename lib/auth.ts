import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Guru from "@/models/Guru";
import Siswa from "@/models/Siswa";
import Kepsek from "@/models/Kepsek";
import Kurikulum from "@/models/Kurikulum";

type Role = "admin" | "guru" | "siswa" | "kepsek" | "kurikulum";

// Daftar semua model per-role. Login akan cek satu-satu sampai ketemu
// email yang cocok, jadi gak perlu tau role-nya di awal.
const ROLE_MODELS: { role: Role; model: any }[] = [
  { role: "admin", model: Admin },
  { role: "guru", model: Guru },
  { role: "siswa", model: Siswa },
  { role: "kepsek", model: Kepsek },
  { role: "kurikulum", model: Kurikulum },
];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        await connectDB();

        const email = credentials.email.toLowerCase();
        let foundUser: any = null;
        let foundRole: Role | null = null;

        for (const { role, model } of ROLE_MODELS) {
          const user = await model.findOne({ email });
          if (user) {
            foundUser = user;
            foundRole = role;
            break;
          }
        }

        if (!foundUser || !foundRole) {
          throw new Error("Email atau password salah");
        }

        const isValid = await bcrypt.compare(credentials.password, foundUser.password);
        if (!isValid) {
          throw new Error("Email atau password salah");
        }

        return {
          id: foundUser._id.toString(),
          name: foundUser.name,
          email: foundUser.email,
          role: foundRole,
          jurusan: foundUser.jurusan,
          kelas: foundUser.kelas,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.jurusan = (user as any).jurusan;
        token.kelas = (user as any).kelas;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).jurusan = token.jurusan;
        (session.user as any).kelas = token.kelas;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};