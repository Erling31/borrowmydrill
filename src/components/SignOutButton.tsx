"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-zinc-500 hover:text-[#1e1f21] transition-colors"
    >
      Logg ut
    </button>
  );
}
