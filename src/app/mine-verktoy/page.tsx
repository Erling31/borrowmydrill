import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Mine verktøy – Naboverktøy" };

const CATEGORIES = ["Alle", "El-verktøy", "Håndverktøy", "Hage", "Stiger", "Annet"];

export default async function MineVerktoyPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/mine-verktoy");

  const { kat } = await searchParams;
  const activeCategory = kat && CATEGORIES.includes(kat) ? kat : "Alle";

  const tools = await db.tool.findMany({
    where: {
      ownerId: session.user.id,
      ...(activeCategory !== "Alle" ? { category: activeCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1e1f21]">Mine verktøy</h1>
        <Link
          href="/tools/new"
          className="bg-coral-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-coral-600 transition-colors shadow-sm"
        >
          + Legg til
        </Link>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={cat === "Alle" ? "/mine-verktoy" : `/mine-verktoy?kat=${encodeURIComponent(cat)}`}
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

      {tools.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-zinc-500 font-medium">
            {activeCategory !== "Alle" ? `Ingen verktøy i kategorien "${activeCategory}".` : "Du har ikke lagt ut noe ennå."}
          </p>
          <Link href="/tools/new" className="mt-3 inline-block text-coral-500 font-semibold hover:underline text-sm">
            Legg ut ditt første verktøy
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center gap-4 p-4"
            >
              <div className="w-14 h-14 rounded-xl bg-coral-50 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                {tool.imageUrl ? (
                  <Image src={tool.imageUrl} alt={tool.name} width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  "🔧"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1e1f21] truncate">{tool.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {tool.category ?? "Ukategorisert"}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  tool.available ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-600"
                }`}
              >
                {tool.available ? "Ledig" : "Utlånt"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
