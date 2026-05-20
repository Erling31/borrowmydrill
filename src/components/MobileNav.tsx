"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  user?: { name?: string | null } | null;
}

export default function MobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
        aria-label={open ? "Lukk meny" : "Åpne meny"}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-zinc-200 shadow-lg z-50">
          <div className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/tools"
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-zinc-700 border-b border-zinc-100"
            >
              Se verktøy
            </Link>
            {user ? (
              <>
                <Link
                  href="/tools/new"
                  onClick={() => setOpen(false)}
                  className="py-3 text-base font-medium text-coral-500 border-b border-warm-100"
                >
                  Legg ut verktøy
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="py-3 text-base font-medium text-zinc-500 text-left"
                >
                  Logg ut ({user.name?.split(" ")[0]})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setOpen(false)}
                  className="py-3 text-base font-medium text-zinc-700 border-b border-zinc-100"
                >
                  Logg inn
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setOpen(false)}
                  className="py-3 text-base font-medium text-coral-500"
                >
                  Registrer deg
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
