import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import RequestActions from "@/components/RequestActions";

// Design tokens matching the prototype exactly
const T = {
  surface: "#ffffff",
  bg:      "#f3f4f1",
  text:    "#1b1d19",
  muted:   "#71756d",
  faint:   "#9a9e95",
  hair:    "#e8e9e4",
  hair2:   "#f0f1ec",
  accent:  "#3f7d52",
  accentSoft: "#e4efe5",
  accentInk:  "#143524",
};

const card: React.CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.hair}`,
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(20,22,18,0.04)",
};

function StatusChip({ tone, children }: { tone: "ok" | "warn" | "danger" | "neutral"; children: React.ReactNode }) {
  const styles = {
    ok:      { color: "#2f6e44", background: "#e2f0e5", border: "1px solid #cbe4d1" },
    warn:    { color: "#9a6a12", background: "#fcf0d8", border: "1px solid #f2dca8" },
    danger:  { color: T.accentInk, background: T.accentSoft, border: "1px solid transparent" },
    neutral: { color: T.muted, background: T.bg, border: "1px solid transparent" },
  };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", ...styles[tone] }}>
      {children}
    </span>
  );
}

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) return <LandingPage />;

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "deg";
  const today = new Date().toLocaleDateString("nb", { weekday: "long", day: "numeric", month: "long" });

  const [myTools, activeLoans, pendingRequests] = await Promise.all([
    db.tool.count({ where: { ownerId: userId } }),
    db.tool.count({ where: { ownerId: userId, available: false } }),
    db.borrowRequest.findMany({
      where: { tool: { ownerId: userId }, status: "pending" },
      include: { user: { select: { name: true, neighborhood: true } }, tool: { select: { name: true, id: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const loanedTools = activeLoans > 0
    ? await db.tool.findMany({
        where: { ownerId: userId, available: false },
        include: {
          requests: {
            where: { status: "approved" },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    : [];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 8px" }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 16px 14px", borderBottom: `1px solid ${T.hair}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.1, color: T.text }}>
            Hei, {firstName} 👋
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{today}</div>
        </div>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* 3-column stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <Link href="/mine-verktoy" style={{ textDecoration: "none" }}>
            <div style={{ ...card, padding: 12, textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 26, lineHeight: 1, color: T.text }}>{myTools}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 500 }}>verktøy</div>
            </div>
          </Link>
          <Link href="/utlan" style={{ textDecoration: "none" }}>
            <div style={{ ...card, padding: 12, textAlign: "center", background: T.accentSoft, border: `1px solid transparent` }}>
              <div style={{ fontWeight: 700, fontSize: 26, lineHeight: 1, color: T.accentInk }}>{activeLoans}</div>
              <div style={{ fontSize: 11, color: T.accentInk, marginTop: 4, fontWeight: 500 }}>utlånt</div>
            </div>
          </Link>
          <div style={{ ...card, padding: 12, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 26, lineHeight: 1, color: T.text }}>{pendingRequests.length}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 500 }}>forespørsel</div>
          </div>
        </div>

        {/* Quick action */}
        <Link href="/tools/new" style={{ textDecoration: "none" }}>
          <div style={{ background: T.accent, color: T.accentInk, borderRadius: 12, padding: "13px 16px", fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em", textAlign: "center", boxShadow: `0 6px 16px -8px ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Legg til verktøy
          </div>
        </Link>

        {/* Pending requests — "Venter på deg" */}
        {pendingRequests.length > 0 && (
          <div>
            <SectionLabel>Venter på deg</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {pendingRequests.map((req) => {
                const initials = req.user.name?.split(" ").map(w => w[0]).slice(0, 2).join("") ?? "?";
                return (
                  <div key={req.id}>
                    <div style={{ ...card, background: T.accentSoft, border: `1px solid transparent`, padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
                      <Avatar initials={initials} size={42} />
                      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.35, color: T.accentInk }}>
                        <strong>{req.user.name?.split(" ")[0]}</strong> vil låne{" "}
                        <strong>{req.tool.name.toLowerCase()}</strong>
                        {req.message ? <span style={{ opacity: 0.75 }}> — &ldquo;{req.message}&rdquo;</span> : null}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <RequestActions requestId={req.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Currently loaned out */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <SectionLabel>Lånt ut nå</SectionLabel>
            <Link href="/utlan" style={{ fontSize: 12.5, fontWeight: 600, color: T.accent, textDecoration: "none" }}>Se alle</Link>
          </div>
          <div style={{ ...card, marginTop: 8, padding: 4, overflow: "hidden" }}>
            {loanedTools.length === 0 ? (
              <div style={{ padding: 16, fontSize: 13, color: T.muted, textAlign: "center" }}>
                Ingenting utlånt akkurat nå 🎉
              </div>
            ) : (
              loanedTools.map((tool, i) => {
                const borrower = tool.requests[0]?.user.name ?? "Ukjent";
                return (
                  <Link key={tool.id} href={`/tools/${tool.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderBottom: i === loanedTools.length - 1 ? "none" : `1px solid ${T.hair2}` }}>
                      <ToolImg size={42} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.name}</div>
                        <div style={{ fontSize: 11.5, color: T.muted }}>hos {borrower}</div>
                      </div>
                      <StatusChip tone="warn">utlånt</StatusChip>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {myTools === 0 && pendingRequests.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: T.muted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
            <p style={{ fontWeight: 500, margin: 0 }}>Du har ingen verktøy ennå.</p>
            <Link href="/tools/new" style={{ display: "inline-block", marginTop: 8, fontSize: 13.5, fontWeight: 700, color: T.accent, textDecoration: "none" }}>
              Legg ut ditt første verktøy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#1b1d19" }}>{children}</div>;
}

function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#e4efe5", border: "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.34, color: "#143524", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ToolImg({ size = 50 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: "linear-gradient(135deg,#eceee9,#e2e5de)", border: "1px solid #e8e9e4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: size * 0.45 }}>
      🔧
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div>
      <section className="bg-white px-4 pt-16 pb-20 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-coral-50 text-coral-600 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            Del verktøy i nabolaget
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-[#1b1d19]">
            Trenger du en drill?{" "}
            <span className="text-coral-500">Spør naboen.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-zinc-500 leading-relaxed">
            Naboverktøy gjør det enkelt å låne og dele elektroverktøy med folk i nabolaget.
            Ingen tur til butikken – ingen grunn til å kjøpe verktøy du bruker én gang.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools" className="w-full sm:w-auto bg-coral-500 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-coral-600 transition-colors text-center" style={{ boxShadow: "0 6px 16px -8px #3f7d52" }}>
              Se tilgjengelig verktøy
            </Link>
            <Link href="/auth/signup" className="w-full sm:w-auto border border-warm-200 bg-white text-[#1b1d19] px-7 py-3.5 rounded-xl font-bold hover:bg-warm-50 transition-colors text-center">
              Opprett konto gratis
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-warm-50 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1b1d19] mb-12">Slik fungerer det</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Legg ut verktøyet ditt", desc: "Legg til navn og beskrivelse. Tar 30 sekunder." },
              { step: "2", title: "Noen sender en forespørsel", desc: "En nabo sender en låneforespørsel med ønskede datoer." },
              { step: "3", title: "Gi det fra deg", desc: "Godkjenn forespørselen, møt naboen, og ferdig." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 text-center" style={{ border: "1px solid #e8e9e4", boxShadow: "0 1px 2px rgba(20,22,18,0.04)" }}>
                <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-500 font-bold flex items-center justify-center text-lg mx-auto mb-4">{step}</div>
                <h3 className="font-bold text-[#1b1d19] mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-coral-500 px-4 py-14 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#143524" }}>Klar til å dele?</h2>
          <p className="mb-7" style={{ color: "#2f6340" }}>Registrer deg gratis og legg ut ditt første verktøy på under ett minutt.</p>
          <Link href="/auth/signup" className="inline-block bg-white font-bold px-8 py-3.5 rounded-xl hover:bg-coral-50 transition-colors" style={{ color: "#3f7d52" }}>
            Kom i gang
          </Link>
        </div>
      </section>
    </div>
  );
}
