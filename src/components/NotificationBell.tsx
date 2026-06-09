"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const T = { surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19", accent: "#3f7d52" };

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { read: boolean }[]) => {
        if (!cancelled) setUnread(list.filter((n) => !n.read).length);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <Link
      href="/varsler"
      style={{
        position: "relative", width: 38, height: 38, borderRadius: 11,
        background: T.bg, color: T.text, display: "flex", alignItems: "center",
        justifyContent: "center", textDecoration: "none", flexShrink: 0,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" />
      </svg>
      {unread > 0 && (
        <span style={{ position: "absolute", top: 7, right: 8, width: 9, height: 9, borderRadius: "50%", background: T.accent, border: `1.5px solid ${T.surface}` }} />
      )}
    </Link>
  );
}
