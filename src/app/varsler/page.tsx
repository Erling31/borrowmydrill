import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import MarkReadOnView from "./MarkReadOnView";

export const metadata = { title: "Varsler – Naboverktøy" };

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", hair2: "#f0f1ec",
  accent: "#3f7d52", accentSoft: "#e4efe5", accentInk: "#143524",
};

const ICONS: Record<string, React.ReactNode> = {
  request: <path d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 5.2a3 3 0 0 1 0 5.6" />,
  approved: <path d="M5 12.5 10 17l9-10" />,
  rejected: <path d="M6 6l12 12M18 6 6 18" />,
  returned: <path d="M7 8h11l-3-3M17 16H6l3 3" />,
};

function NIcon({ type }: { type: string }) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: 11, background: T.bg, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[type] ?? ICONS.request}
      </svg>
    </div>
  );
}

function timeAgo(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "akkurat nå";
  if (min < 60) return `for ${min} min siden`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `for ${hr} t siden`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "i går";
  if (day < 7) return `${day} dager siden`;
  return new Date(date).toLocaleDateString("nb", { day: "numeric", month: "short" });
}

export default async function VarslerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/varsler");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <MarkReadOnView />
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 16px 12px", borderBottom: `1px solid ${T.hair}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text }}>Varsler</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{notifications.length} totalt</div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 16px", color: T.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
          <p style={{ fontWeight: 500, margin: 0 }}>Ingen varsler ennå.</p>
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {notifications.map((n) => {
            const row = (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: n.read ? T.surface : T.accentSoft,
                  borderBottom: `1px solid ${T.hair2}`,
                }}
              >
                <NIcon type={n.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: n.read ? T.text : T.accentInk }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: n.read ? T.muted : T.accentInk, opacity: n.read ? 1 : 0.8, marginTop: 1 }}>{n.body}</div>
                </div>
                <span style={{ fontSize: 10.5, color: T.muted, flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                {row}
              </Link>
            ) : (
              <div key={n.id}>{row}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
