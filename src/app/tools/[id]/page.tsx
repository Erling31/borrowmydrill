import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ToolActions from "@/components/ToolActions";

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tool, session] = await Promise.all([
    db.tool.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, neighborhood: true } } },
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
          <div className="relative w-full aspect-video bg-warm-100">
            <Image src={tool.imageUrl} alt={tool.name} fill className="object-cover" />
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
          <p className="mt-4 text-zinc-600 leading-relaxed">{tool.description}</p>

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
