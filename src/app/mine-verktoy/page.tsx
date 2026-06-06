import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Mine verktøy – Naboverktøy" };

const CATEGORIES = ["Alle", "El-verktøy", "Håndverktøy", "Hage", "Stiger", "Annet"];

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", hair2: "#f0f1ec",
  accent: "#3f7d52", accentSoft: "#e4efe5", accentInk: "#143524",
};

function StatusChip({ status }: { status: string }) {
  if (status === "home") {
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: "#2f6e44", background: "#e2f0e5", border: "1px solid #cbe4d1", whiteSpace: "nowrap" }}>hjemme</span>;
  }
  if (status === "overdue") {
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: T.accentInk, background: T.accentSoft, border: "1px solid transparent", whiteSpace: "nowrap" }}>forfalt</span>;
  }
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: "#9a6a12", background: "#fcf0d8", border: "1px solid #f2dca8", whiteSpace: "nowrap" }}>utlånt</span>;
}

export default async function MineVerktoyPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/mine-verktoy");

  const { kat } = await searchParams;
  const activeCategory = kat && CATEGORIES.includes(kat) ? kat : "Alle";

  const tools = await db.tool.findMany({
    where: {
      ownerId: session.user.id,
      ...(activeCategory !== "Alle" ? { category: activeCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const lentCount = tools.filter(t => !t.available).length;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 16px 12px", borderBottom: `1px solid ${T.hair}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text }}>Mine verktøy</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{tools.length} totalt · {lentCount} utlånt</div>
        </div>
        <Link href="/tools/new" style={{ width: 38, height: 38, borderRadius: 11, background: T.bg, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </Link>
      </div>

      {/* Category filter chips */}
      <div style={{ background: T.surface, padding: "0 16px 10px", borderBottom: `1px solid ${T.hair}` }}>
        <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingTop: 10 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={cat === "Alle" ? "/mine-verktoy" : `/mine-verktoy?kat=${encodeURIComponent(cat)}`}
                style={{ textDecoration: "none", whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 600, padding: "6px 13px", borderRadius: 999, color: active ? T.accentInk : T.text, background: active ? T.accent : T.surface, border: `1px solid ${active ? "transparent" : T.hair}` }}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tool list */}
      {tools.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 16px", color: T.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
          <p style={{ fontWeight: 500, margin: 0 }}>
            {activeCategory !== "Alle" ? `Ingen verktøy i "${activeCategory}".` : "Du har ikke lagt ut noe ennå."}
          </p>
          <Link href="/tools/new" style={{ display: "inline-block", marginTop: 8, fontSize: 13.5, fontWeight: 700, color: T.accent, textDecoration: "none" }}>
            Legg til verktøy
          </Link>
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {tools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: T.surface, borderBottom: `1px solid ${T.hair2}` }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: "linear-gradient(135deg,#eceee9,#e2e5de)", border: `1px solid ${T.hair}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {tool.imageUrl ? (
                  <Image src={tool.imageUrl} alt={tool.name} width={50} height={50} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 22 }}>🔧</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.name}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{tool.category ?? "Ukategorisert"}</div>
              </div>
              <StatusChip status={tool.available ? "home" : "lent"} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
