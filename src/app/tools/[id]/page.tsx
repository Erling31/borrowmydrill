import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ToolActions from "@/components/ToolActions";

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tool, session] = await Promise.all([
    db.tool.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, neighborhood: true } },
        requests: {
          where: { status: { in: ["approved", "returned"] } },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    auth(),
  ]);
  if (!tool) notFound();

  const isOwner = session?.user?.id === tool.owner.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-[#1e1f21] mb-5 py-1 transition-colors">
        ← Tilbake til verktøy
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Tool image */}
        {tool.imageUrl && (
          <div className="w-full aspect-video bg-warm-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tool.imageUrl} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-4">
            {!tool.imageUrl && (
              <div className="w-14 h-14 bg-coral-50 rounded-2xl flex items-center justify-center text-3xl mr-4">
                🔧
              </div>
            )}
            <div className="flex-1 flex items-center justify-between gap-3">
              <span
                className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  tool.available ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {tool.available ? "Ledig" : "Utlånt"}
              </span>
              {isOwner && <ToolActions toolId={tool.id} />}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1e1f21]">{tool.name}</h1>
          <p className="text-zinc-500 mt-1 text-sm">{tool.owner.name} · {tool.owner.neighborhood}</p>

          {(tool.value || tool.condition) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tool.value != null && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-warm-100 text-zinc-600">
                  Verdi ca. {tool.value.toLocaleString("nb")} kr
                </span>
              )}
              {tool.condition && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-warm-100 text-zinc-600">
                  Stand: {tool.condition}
                </span>
              )}
            </div>
          )}

          <p className="mt-4 text-zinc-600 leading-relaxed">{tool.description}</p>

          {tool.requests.length > 0 && (
            <div className="mt-7">
              <h2 className="text-sm font-bold text-[#1e1f21] mb-3">Historikk</h2>
              <div className="flex flex-col gap-2">
                {tool.requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 bg-warm-50 rounded-xl px-4 py-3 text-sm">
                    <span className="text-zinc-600">
                      Lånt av <strong className="text-[#1e1f21] font-semibold">{r.user.name}</strong>
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === "returned" ? "bg-zinc-100 text-zinc-500" : "bg-green-100 text-green-700"}`}>
                      {r.status === "returned" ? "Returnert" : "Pågår"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tool.available && !isOwner && (
            <Link
              href={`/tools/${tool.id}/request`}
              className="mt-7 block w-full bg-coral-500 text-white text-center py-4 rounded-full font-semibold hover:bg-coral-600 active:bg-coral-700 transition-colors shadow-sm"
            >
              Send låneforespørsel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
