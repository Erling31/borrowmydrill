import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-zinc-200 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Trenger du en drill? <span className="text-orange-600">Spør naboen.</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-zinc-500">
          BorrowMyDrill gjør det enkelt å dele og låne elektroverktøy med folk i nabolaget ditt.
          Ingen tur til butikken, og du slipper å kjøpe verktøy du bare bruker én gang.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/tools"
            className="bg-orange-600 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Se verktøy
          </Link>
          <Link
            href="/tools/new"
            className="border border-zinc-300 text-zinc-700 px-6 py-3 rounded-full font-medium hover:bg-zinc-100 transition-colors"
          >
            Legg ut ditt verktøy
          </Link>
        </div>
      </section>

      {/* Slik fungerer det */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Slik fungerer det</h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            { step: "1", title: "Legg ut verktøyet ditt", desc: "Legg til navn og beskrivelse. Tar 30 sekunder." },
            { step: "2", title: "Noen sender en forespørsel", desc: "En nabo sender en låneforespørsel med ønskede datoer." },
            { step: "3", title: "Gi det fra deg", desc: "Godkjenn forespørselen, møt naboen, og ferdig." },
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
