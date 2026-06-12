import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Naboer – Naboverktøy" };

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", hair2: "#f0f1ec",
  accent: "#3f7d52", accentSoft: "#e4efe5", accentInk: "#143524",
};

export default async function NaboerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/naboer");

  const neighbors = await db.user.findMany({
    where: { id: { not: session.user.id } },
    select: {
      id: true,
      name: true,
      neighborhood: true,
      tools: { where: { visible: true }, select: { available: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 16px 12px", borderBottom: `1px solid ${T.hair}` }}>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text }}>Naboer</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{neighbors.length} naboer i nabolaget</div>
      </div>

      {/* Neighbor list */}
      {neighbors.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 16px", color: T.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
          <p style={{ fontWeight: 500, margin: 0 }}>Ingen andre naboer er registrert ennå.</p>
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {neighbors.map((n) => {
            const initials = n.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? "?";
            const total = n.tools.length;
            const availableCount = n.tools.filter((t) => t.available).length;
            return (
              <Link key={n.id} href={`/naboer/${n.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: T.surface, borderBottom: `1px solid ${T.hair2}` }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: T.accentInk, flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {n.neighborhood} · {total} {total === 1 ? "verktøy" : "verktøy"}
                    {total > 0 && <> · {availableCount} ledig</>}
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
