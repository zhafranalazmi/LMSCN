import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Mapping: prefix path dashboard -> role yang diizinkan
const ROLE_PATH_MAP: Record<string, string> = {
  "/dashboard/admin": "admin",
  "/dashboard/guru": "guru",
  "/dashboard/kepsek": "kepsek",
  "/dashboard/kurikulum": "kurikulum",
  "/dashboard/siswa": "siswa",
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    const matchedPrefix = Object.keys(ROLE_PATH_MAP).find((prefix) =>
      pathname.startsWith(prefix)
    );

    if (matchedPrefix && role !== ROLE_PATH_MAP[matchedPrefix]) {
      // Role tidak cocok dengan area dashboard yang diakses -> redirect ke dashboard sendiri
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // wajib login untuk semua /dashboard/*
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
