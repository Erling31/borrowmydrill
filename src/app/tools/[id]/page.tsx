import Link from "next/link";
import { notFound } from "next/navigation";

const MOCK_TOOLS = [
  { id: "1", name: "DeWalt Cordless Drill", owner: "Maria S.", neighborhood: "Oak Street", available: true, description: "18V cordless drill with two batteries and a charger. Good for general household tasks." },
  { id: "2", name: "Circular Saw", owner: "James K.", neighborhood: "Elm Ave", available: true, description: "7.25\" circular saw, perfect for cutting lumber and sheet goods." },
  { id: "3", name: "Random Orbital Sander", owner: "Priya N.", neighborhood: "Oak Street", available: false, description: "5\" random orbital sander. Comes with assorted sandpaper pads." },
  { id: "4", name: "Jigsaw", owner: "Tom B.", neighborhood: "Cedar Rd", available: true, description: "Variable speed jigsaw for curved and straight cuts in wood and metal." },
];

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = MOCK_TOOLS.find((t) => t.id === id);
  if (!tool) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/tools" className="text-sm text-zinc-500 hover:text-zinc-700 mb-6 inline-block">
        ← Back to tools
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-3xl">
            🔧
          </div>
          <span
            className={`text-sm font-medium px-3 py-1.5 rounded-full ${
              tool.available ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {tool.available ? "Available" : "Currently Borrowed"}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900">{tool.name}</h1>
        <p className="text-zinc-500 mt-1">{tool.owner} · {tool.neighborhood}</p>
        <p className="mt-4 text-zinc-700 leading-relaxed">{tool.description}</p>

        {tool.available && (
          <Link
            href={`/tools/${tool.id}/request`}
            className="mt-8 block w-full bg-orange-600 text-white text-center py-3 rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Request to Borrow
          </Link>
        )}
      </div>
    </div>
  );
}
