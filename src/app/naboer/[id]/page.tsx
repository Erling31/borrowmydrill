import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", hair2: "#f0f1ec",
  accent: "#3f7d52", accentSoft: "#e4efe5", accentInk: "#143524",
};

export default async function NaboPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/naboer");

  const { id } = await params;
  const neighbor = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      neighborhood: true,
      tools: {
        where: { visible: true },
        orderBy: [{ available: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!neighbor) notFound();

  const initials = neighbor.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? "?";
  const availableCount = neighbor.tools.filter((t) => t.available).length;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 16px 14px", borderBottom: `1px solid ${T.hair}` }}>
        <Link href="/naboer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: T.muted, textDecoration: "none", marginBottom: 10 }}>
          ← Alle naboer
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, color: T.accentInk, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text }}>{neighbor.name}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              {neighbor.neighborhood} · {neighbor.tools.length} verktøy · {availableCount} ledig
            </div>
          </div>
        </div>
      </div>

      {/* Tool list */}
      {neighbor.tools.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 16px", color: T.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
          <p style={{ fontWeight: 500, margin: 0 }}>{neighbor.name?.split(" ")[0]} har ikke lagt ut noen verktøy ennå.</p>
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {neighbor.tools.map((tool) => (
            <div key={tool.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: T.surface, borderBottom: `1px solid ${T.hair2}` }}>
              <Link href={`/tools/${tool.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#eceee9,#e2e5de)", border: `1px solid ${T.hair}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {tool.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tool.imageUrl} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <span style={{ fontSize: 20 }}>🔧</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{tool.category ?? "Ukategorisert"}</div>
                </div>
              </Link>
              {tool.available ? (
                <Link
                  href={`/tools/${tool.id}/request`}
                  style={{ textDecoration: "none", background: T.accent, color: T.accentInk, borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", flexShrink: 0, boxShadow: `0 6px 16px -8px ${T.accent}` }}
                >
                  Spør
                </Link>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: T.muted, background: T.bg, border: `1px solid transparent`, flexShrink: 0 }}>opptatt</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
