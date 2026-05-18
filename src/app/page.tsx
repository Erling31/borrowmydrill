import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-zinc-200 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Need a drill? <span className="text-orange-600">Ask a neighbor.</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-zinc-500">
          BorrowMyDrill makes it easy to share and borrow power tools with people on your street.
          No hardware store runs, no buying tools you'll use once.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/tools"
            className="bg-orange-600 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Browse Tools
          </Link>
          <Link
            href="/tools/new"
            className="border border-zinc-300 text-zinc-700 px-6 py-3 rounded-full font-medium hover:bg-zinc-100 transition-colors"
          >
            List Your Tool
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            { step: "1", title: "List your tool", desc: "Add a photo, name, and availability. Takes 30 seconds." },
            { step: "2", title: "Someone requests it", desc: "A neighbor sends a borrow request with their preferred dates." },
            { step: "3", title: "Hand it over", desc: "Approve the request, meet your neighbor, and done." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-zinc-900">{title}</h3>
              <p className="text-zinc-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
