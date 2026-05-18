import Link from "next/link";

export const metadata = { title: "Browse Tools – BorrowMyDrill" };

// Placeholder data until we wire up a database
const MOCK_TOOLS = [
  { id: "1", name: "DeWalt Cordless Drill", owner: "Maria S.", neighborhood: "Oak Street", available: true },
  { id: "2", name: "Circular Saw", owner: "James K.", neighborhood: "Elm Ave", available: true },
  { id: "3", name: "Random Orbital Sander", owner: "Priya N.", neighborhood: "Oak Street", available: false },
  { id: "4", name: "Jigsaw", owner: "Tom B.", neighborhood: "Cedar Rd", available: true },
];

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Available Tools</h1>
        <Link
          href="/tools/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          List a Tool
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_TOOLS.map((tool) => (
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
                {tool.available ? "Available" : "Borrowed"}
              </span>
            </div>
            <h3 className="font-semibold text-zinc-900">{tool.name}</h3>
            <p className="text-sm text-zinc-500 mt-1">{tool.owner} · {tool.neighborhood}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
