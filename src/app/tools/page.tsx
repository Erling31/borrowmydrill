import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const metadata = { title: "Naboers verktøy – Naboverktøy" };

const CATEGORIES = ["Alle", "El-verktøy", "Håndverktøy", "Hage", "Stiger", "Annet"];

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string }>;
}) {
  const [session, { kat }] = await Promise.all([auth(), searchParams]);
  const activeCategory = kat && CATEGORIES.includes(kat) ? kat : "Alle";

  const tools = await db.tool.findMany({
    where: {
      ...(activeCategory !== "Alle" ? { category: activeCategory } : {}),
    },
    include: { owner: { select: { name: true, neighborhood: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Exclude own tools if logged in (to show as neighbor view)
  const neighborTools = session?.user?.id
    ? tools.filter((t) => t.owner.name !== session.user?.name)
    : tools;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1e1f21]">Verktøy i nabolaget</h1>
          {neighborTools.length > 0 && (
            <p className="text-sm text-zinc-500 mt-0.5">{neighborTools.length} verktøy tilgjengelig</p>
          )}
        </div>
        {session?.user && (
          <Link
            href="/tools/new"
            className="bg-coral-500 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-coral-600 transition-colors shadow-sm"
          >
            Legg ut
          </Link>
        )}
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={cat === "Alle" ? "/tools" : `/tools?kat=${encodeURIComponent(cat)}`}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeCategory === cat
                ? "bg-coral-500 text-white border-coral-500"
                : "bg-white text-zinc-600 border-warm-200 hover:border-coral-300"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {neighborTools.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-zinc-500 font-medium">
            {activeCategory !== "Alle"
              ? `Ingen verktøy i kategorien "${activeCategory}".`
              : "Ingen verktøy er lagt ut ennå."}
          </p>
          {session?.user && (
            <Link href="/tools/new" className="mt-3 inline-block text-coral-500 font-semibold hover:underline text-sm">
              Vær den første!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {neighborTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden"
            >
              {tool.imageUrl ? (
                <div className="relative w-full aspect-video bg-warm-100">
                  <Image src={tool.imageUrl} alt={tool.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-video bg-coral-50 flex items-center justify-center text-4xl">🔧</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1e1f21] leading-snug truncate">{tool.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{tool.owner.name} · {tool.owner.neighborhood}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      tool.available ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tool.available ? "Ledig" : "Utlånt"}
                  </span>
                </div>
                {tool.category && (
                  <span className="mt-2 inline-block text-xs bg-warm-100 text-zinc-500 px-2 py-0.5 rounded-full">
                    {tool.category}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
