"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
    >
      Sign out
    </button>
  );
}
