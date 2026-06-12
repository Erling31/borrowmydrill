import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const metadata = { title: "Send forespørsel – Naboverktøy" };

const CATEGORIES = ["Alle", "El-verktøy", "Håndverktøy", "Hage", "Stiger", "Annet"];

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", hair2: "#f0f1ec",
  accent: "#3f7d52", accentSoft: "#e4efe5", accentInk: "#143524",
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string }>;
}) {
  const [session, { kat }] = await Promise.all([auth(), searchParams]);
  const activeCategory = kat && CATEGORIES.includes(kat) ? kat : "Alle";

  const tools = await db.tool.findMany({
    where: { visible: true, ...(activeCategory !== "Alle" ? { category: activeCategory } : {}) },
    include: { owner: { select: { id: true, name: true, neighborhood: true } } },
    orderBy: { createdAt: "desc" },
  });

  const neighborTools = session?.user?.id
    ? tools.filter((t) => t.owner.id !== session.user?.id)
    : tools;

  // Count completed loans per owner ("lånt X ganger")
  const ownerIds = [...new Set(neighborTools.map((t) => t.owner.id))];
  const loanCounts = ownerIds.length
    ? await db.borrowRequest.groupBy({
        by: ["toolId"],
        where: { tool: { ownerId: { in: ownerIds } }, status: "returned" },
        _count: { _all: true },
      })
    : [];
  const toolLoanCount = new Map(loanCounts.map((l) => [l.toolId, l._count._all]));
  // Aggregate to owner level
  const ownerLoanCount = new Map<string, number>();
  for (const t of neighborTools) {
    const c = toolLoanCount.get(t.id) ?? 0;
    ownerLoanCount.set(t.owner.id, (ownerLoanCount.get(t.owner.id) ?? 0) + c);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 16px 12px", borderBottom: `1px solid ${T.hair}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text }}>Send forespørsel</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{neighborTools.length} verktøy i nabolaget</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: T.bg, color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      {/* Category filter chips */}
      <div style={{ background: T.surface, padding: "0 16px 10px", borderBottom: `1px solid ${T.hair}` }}>
        <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingTop: 10 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={cat === "Alle" ? "/tools" : `/tools?kat=${encodeURIComponent(cat)}`}
                style={{ textDecoration: "none", whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 600, padding: "6px 13px", borderRadius: 999, color: active ? T.accentInk : T.text, background: active ? T.accent : T.surface, border: `1px solid ${active ? "transparent" : T.hair}` }}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tool list */}
      {neighborTools.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 16px", color: T.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
          <p style={{ fontWeight: 500, margin: 0 }}>
            {activeCategory !== "Alle" ? `Ingen verktøy i "${activeCategory}".` : "Ingen verktøy er lagt ut ennå."}
          </p>
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {neighborTools.map((tool) => (
            <div key={tool.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: T.surface, borderBottom: `1px solid ${T.hair2}` }}>
              {/* Tool image */}
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
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {tool.owner.name?.split(" ")[0]} · {tool.owner.neighborhood}
                    {(ownerLoanCount.get(tool.owner.id) ?? 0) > 0 && (
                      <> · lånt ut {ownerLoanCount.get(tool.owner.id)} {ownerLoanCount.get(tool.owner.id) === 1 ? "gang" : "ganger"}</>
                    )}
                  </div>
                </div>
              </Link>
              {/* Action */}
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
