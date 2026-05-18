import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Se verktøy – BorrowMyDrill" };

export default async function ToolsPage() {
  const tools = await db.tool.findMany({
    include: { owner: { select: { name: true, neighborhood: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Tilgjengelig verktøy</h1>
        <Link
          href="/tools/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          Legg ut verktøy
        </Link>
      </div>

      {tools.length === 0 && (
        <p className="text-zinc-500 text-center py-20">
          Ingen verktøy er lagt ut ennå.{" "}
          <Link href="/tools/new" className="text-orange-600 hover:underline">Vær den første!</Link>
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-orange-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-2xl">
                🔧
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  tool.available
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {tool.available ? "Ledig" : "Utlånt"}
              </span>
            </div>
            <h3 className="font-semibold text-zinc-900">{tool.name}</h3>
            <p className="text-sm text-zinc-500 mt-1">{tool.owner.name} · {tool.owner.neighborhood}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
