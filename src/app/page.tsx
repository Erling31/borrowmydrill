import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import RequestActions from "@/components/RequestActions";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return <LandingPage />;
  }

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "deg";

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
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#1b1d19] mb-5">
        Hei, {firstName} 👋
      </h1>

      {/* 3-column stat grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Link href="/mine-verktoy" className="bg-white rounded-2xl p-3 text-center shadow-sm border border-warm-200 hover:border-coral-300 transition-colors">
          <div className="text-2xl font-bold text-[#1b1d19] leading-none">{myTools}</div>
          <div className="text-xs text-zinc-500 mt-1 font-medium">verktøy</div>
        </Link>
        <Link href="/utlan" className="bg-coral-100 rounded-2xl p-3 text-center shadow-sm border border-transparent">
          <div className="text-2xl font-bold text-coral-700 leading-none">{activeLoans}</div>
          <div className="text-xs text-coral-600 mt-1 font-medium">utlånt</div>
        </Link>
        <Link href="/" className="bg-white rounded-2xl p-3 text-center shadow-sm border border-warm-200 hover:border-coral-300 transition-colors">
          <div className="text-2xl font-bold text-[#1b1d19] leading-none">{pendingRequests.length}</div>
          <div className="text-xs text-zinc-500 mt-1 font-medium">forespørsel</div>
        </Link>
      </div>

      {/* Quick action */}
      <Link
        href="/tools/new"
        className="flex items-center justify-center gap-2 w-full bg-coral-500 text-white text-center py-3.5 rounded-2xl font-semibold hover:bg-coral-600 transition-colors mb-6"
        style={{ boxShadow: "0 6px 16px -8px #3f7d52" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Legg til verktøy
      </Link>

      {/* Currently loaned out */}
      {loanedTools.length > 0 && (
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1b1d19] uppercase tracking-wide">Lånt ut nå</h2>
            <Link href="/utlan" className="text-xs text-coral-500 font-semibold">Se alle →</Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-warm-100">
            {loanedTools.map((tool) => {
              const borrower = tool.requests[0]?.user.name ?? "Ukjent";
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-coral-50 flex items-center justify-center text-lg shrink-0">🔧</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#1b1d19] truncate">{tool.name}</p>
                    <p className="text-xs text-zinc-500">hos {borrower}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">utlånt</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-[#1b1d19] uppercase tracking-wide mb-3">
            Forespørsler ({pendingRequests.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-sm text-[#1b1d19] leading-snug mb-3">
                  <span className="font-bold">{req.user.name}</span>
                  {req.user.neighborhood ? ` (${req.user.neighborhood})` : ""} spør om å låne{" "}
                  <Link href={`/tools/${req.tool.id}`} className="font-bold text-coral-500 hover:underline">
                    {req.tool.name}
                  </Link>
                  {req.message ? <span className="text-zinc-500"> — "{req.message}"</span> : null}
                </p>
                <p className="text-xs text-zinc-400 mb-3">
                  {new Date(req.startDate).toLocaleDateString("nb", { day: "numeric", month: "short" })}
                  {" – "}
                  {new Date(req.endDate).toLocaleDateString("nb", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <RequestActions requestId={req.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {myTools === 0 && pendingRequests.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <div className="text-4xl mb-3">🔧</div>
          <p className="font-medium">Du har ingen verktøy ennå.</p>
          <Link href="/tools/new" className="mt-2 inline-block text-coral-500 font-semibold hover:underline text-sm">
            Legg ut ditt første verktøy
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Landing page for non-logged-in users ───────────────────────────

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
            BorrowMyDrill gjør det enkelt å låne og dele elektroverktøy med folk i nabolaget.
            Ingen tur til butikken – ingen grunn til å kjøpe verktøy du bruker én gang.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tools"
              className="w-full sm:w-auto bg-coral-500 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-coral-600 transition-colors text-center shadow-sm"
            >
              Se tilgjengelig verktøy
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto border border-warm-200 bg-white text-zinc-700 px-7 py-3.5 rounded-full font-semibold hover:bg-warm-50 transition-colors text-center"
            >
              Opprett konto gratis
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-warm-50 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1b1d19] mb-12">
            Slik fungerer det
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Legg ut verktøyet ditt", desc: "Legg til navn og beskrivelse. Tar 30 sekunder." },
              { step: "2", title: "Noen sender en forespørsel", desc: "En nabo sender en låneforespørsel med ønskede datoer." },
              { step: "3", title: "Gi det fra deg", desc: "Godkjenn forespørselen, møt naboen, og ferdig." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-500 font-bold flex items-center justify-center text-lg mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-[#1b1d19] mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-coral-500 px-4 py-14 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Klar til å dele?</h2>
          <p className="text-coral-100 mb-7">
            Registrer deg gratis og legg ut ditt første verktøy på under ett minutt.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-coral-600 font-semibold px-8 py-3.5 rounded-full hover:bg-coral-50 transition-colors shadow-sm"
          >
            Kom i gang
          </Link>
        </div>
      </section>
    </div>
  );
}
