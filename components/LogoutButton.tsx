"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium text-plum-700 hover:text-plum-900"
    >
      Keluar
    </button>
  );
}
