import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Se verktøy – BorrowMyDrill" };

export default async function ToolsPage() {
  const tools = await db.tool.findMany({
    include: { owner: { select: { name: true, neighborhood: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e1f21]">Tilgjengelig verktøy</h1>
          {tools.length > 0 && (
            <p className="text-sm text-zinc-500 mt-0.5">{tools.length} verktøy i nabolaget</p>
          )}
        </div>
        <Link
          href="/tools/new"
          className="bg-coral-500 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-coral-600 transition-colors shadow-sm"
        >
          Legg ut verktøy
        </Link>
      </div>

      {tools.length === 0 && (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">🔧</div>
          <p className="text-zinc-500 font-medium">Ingen verktøy er lagt ut ennå.</p>
          <Link href="/tools/new" className="mt-3 inline-block text-coral-500 font-semibold hover:underline">
            Vær den første!
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 bg-coral-50 rounded-xl flex items-center justify-center text-2xl">
                🔧
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  tool.available
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {tool.available ? "Ledig" : "Utlånt"}
              </span>
            </div>
            <h3 className="font-semibold text-[#1e1f21] leading-snug">{tool.name}</h3>
            <p className="text-sm text-zinc-500 mt-1">{tool.owner.name} · {tool.owner.neighborhood}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
