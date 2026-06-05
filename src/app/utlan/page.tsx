import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import RequestActions from "@/components/RequestActions";

export const metadata = { title: "Utlån – BorrowMyDrill" };

function timeProgress(start: Date, end: Date): number {
  const now = Date.now();
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 1;
  return Math.min(1.1, (now - start.getTime()) / total);
}

function formatDate(d: Date) {
  return d.toLocaleDateString("nb", { day: "numeric", month: "short" });
}

function dueLabel(end: Date): { text: string; color: string } {
  const diff = Math.round((end.getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { text: `${Math.abs(diff)} dager over`, color: "text-red-500" };
  if (diff === 0) return { text: "i dag", color: "text-amber-500" };
  if (diff === 1) return { text: "i morgen", color: "text-amber-500" };
  return { text: `${diff} dager igjen`, color: "text-zinc-500" };
}

export default async function UtlanPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/utlan");

  const userId = session.user.id;
  const { fane } = await searchParams;
  const activeTab = fane === "innlant" ? "innlant" : fane === "historikk" ? "historikk" : "aktive";

  const [activeOut, activeIn, history] = await Promise.all([
    // Tools I own that are currently approved/out
    db.borrowRequest.findMany({
      where: { tool: { ownerId: userId }, status: "approved" },
      include: { user: { select: { name: true, neighborhood: true } }, tool: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { endDate: "asc" },
    }),
    // Tools I'm currently borrowing
    db.borrowRequest.findMany({
      where: { userId, status: "approved" },
      include: { tool: { select: { id: true, name: true, imageUrl: true }, include: { owner: { select: { name: true } } } } },
      orderBy: { endDate: "asc" },
    }),
    // Returned or rejected
    db.borrowRequest.findMany({
      where: {
        OR: [
          { tool: { ownerId: userId }, status: { in: ["returned", "rejected"] } },
          { userId, status: { in: ["returned", "rejected"] } },
        ],
      },
      include: {
        user: { select: { name: true } },
        tool: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const tabs = [
    { id: "aktive", label: `Aktive · ${activeOut.length}`, href: "/utlan" },
    { id: "innlant", label: `Lånt inn · ${activeIn.length}`, href: "/utlan?fane=innlant" },
    { id: "historikk", label: "Historikk", href: "/utlan?fane=historikk" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#1e1f21] mb-4">Utlån</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === tab.id
                ? "bg-coral-500 text-white border-coral-500"
                : "bg-white text-zinc-600 border-warm-200 hover:border-coral-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === "aktive" && (
        <div className="flex flex-col gap-4">
          {activeOut.length === 0 ? (
            <EmptyState text="Ingen verktøy ute på lån." />
          ) : (
            activeOut.map((req) => {
              const pct = timeProgress(req.startDate, req.endDate);
              const due = dueLabel(req.endDate);
              const overdue = pct > 1;
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex gap-3 items-center mb-3">
                    <ToolThumb imageUrl={req.tool.imageUrl} name={req.tool.name} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/tools/${req.tool.id}`} className="font-bold text-[#1e1f21] text-sm hover:text-coral-500">
                        {req.tool.name}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {req.user.name} · siden {formatDate(req.startDate)}
                      </p>
                    </div>
                    <span className={`text-xs font-bold ${due.color}`}>{due.text}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${overdue ? "bg-red-400" : pct > 0.75 ? "bg-amber-400" : "bg-coral-400"}`}
                      style={{ width: `${Math.min(100, pct * 100)}%` }}
                    />
                  </div>
                  <RequestActions requestId={req.id} showReturn />
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "innlant" && (
        <div className="flex flex-col gap-4">
          {activeIn.length === 0 ? (
            <EmptyState text="Du har ikke lånt noe for øyeblikket." />
          ) : (
            activeIn.map((req) => {
              const due = dueLabel(req.endDate);
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-center">
                  <ToolThumb imageUrl={req.tool.imageUrl} name={req.tool.name} />
                  <div className="flex-1 min-w-0">
                    <Link href={`/tools/${req.tool.id}`} className="font-bold text-[#1e1f21] text-sm hover:text-coral-500">
                      {req.tool.name}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      fra {req.tool.owner.name}
                    </p>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${due.color}`}>{due.text}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "historikk" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-warm-100">
          {history.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <p>Ingen historikk ennå.</p>
            </div>
          ) : (
            history.map((req) => (
              <div key={req.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/tools/${req.tool.id}`} className="text-sm font-semibold text-[#1e1f21] hover:text-coral-500 truncate block">
                    {req.tool.name}
                  </Link>
                  <p className="text-xs text-zinc-400">{req.user.name}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    req.status === "returned" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {req.status === "returned" ? "returnert" : "avslått"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ToolThumb({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-coral-50 flex items-center justify-center text-xl overflow-hidden shrink-0">
      {imageUrl ? (
        <Image src={imageUrl} alt={name} width={48} height={48} className="w-full h-full object-cover" />
      ) : (
        "🔧"
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-zinc-400">
      <div className="text-4xl mb-3">📋</div>
      <p>{text}</p>
    </div>
  );
}
