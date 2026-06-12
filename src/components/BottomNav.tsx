"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Hjem",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />
      </svg>
    ),
  },
  {
    href: "/mine-verktoy",
    label: "Mine verktøy",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="13" y="4" width="7" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/tools",
    label: "Send forespørsel",
    fab: true,
    icon: (_active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13" />
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
  {
    href: "/utlan",
    label: "Utlån",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 8h11l-3-3M17 16H6l3 3" />
      </svg>
    ),
  },
  {
    href: "/naboer",
    label: "Naboer",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 5.2a3 3 0 0 1 0 5.6" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 items-center px-3 pt-2 pb-1 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

          if (tab.fab) {
            return (
              <div key={tab.href} className="flex justify-center">
                <Link
                  href={tab.href}
                  className="flex flex-col items-center gap-1 -translate-y-5"
                >
                  <div
                    className="w-13 h-13 rounded-2xl bg-coral-500 text-white flex items-center justify-center"
                    style={{ width: 52, height: 52, boxShadow: "0 8px 20px -6px #3f7d52" }}
                  >
                    {tab.icon(false)}
                  </div>
                  <span className="text-[10px] font-semibold text-coral-500 -mt-1 whitespace-nowrap">{tab.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 transition-colors ${
                active ? "text-coral-500" : "text-zinc-400"
              }`}
            >
              {tab.icon(active)}
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
