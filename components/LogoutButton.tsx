"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium text-navy-700 hover:text-navy-900"
    >
      Keluar
    </button>
  );
}
