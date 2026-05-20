import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = await db.tool.findUnique({
    where: { id },
    include: { owner: { select: { name: true, neighborhood: true } } },
  });
  if (!tool) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5 py-1">
        ← Tilbake til verktøy
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-8">
        <div className="flex items-start justify-between mb-5">
          <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-3xl">
            🔧
          </div>
          <span
            className={`text-sm font-medium px-3 py-1.5 rounded-full ${
              tool.available ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {tool.available ? "Ledig" : "Utlånt"}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">{tool.name}</h1>
        <p className="text-zinc-500 mt-1">{tool.owner.name} · {tool.owner.neighborhood}</p>
        <p className="mt-4 text-zinc-700 leading-relaxed">{tool.description}</p>

        {tool.available && (
          <Link
            href={`/tools/${tool.id}/request`}
            className="mt-6 block w-full bg-orange-600 text-white text-center py-4 rounded-full font-medium hover:bg-orange-700 active:bg-orange-800 transition-colors text-base"
          >
            Send låneforespørsel
          </Link>
        )}
      </div>
    </div>
  );
}
