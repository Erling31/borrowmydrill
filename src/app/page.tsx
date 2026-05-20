import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white px-4 pt-16 pb-20 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-coral-50 text-coral-600 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            Del verktøy i nabolaget
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-[#1e1f21]">
            Trenger du en drill?{" "}
            <span className="text-coral-500">Spør naboen.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-zinc-500 leading-relaxed">
            BorrowMyDrill gjør det enkelt å låne og dele elektroverktøy med folk i nabolaget.
            Ingen tur til butikken – ingen grunn til å kjøpe verktøy du bruker én gang.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tools"
              className="w-full sm:w-auto bg-coral-500 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-coral-600 transition-colors text-center shadow-sm"
            >
              Se tilgjengelig verktøy
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto border border-warm-200 bg-white text-zinc-700 px-7 py-3.5 rounded-full font-semibold hover:bg-warm-50 transition-colors text-center"
            >
              Opprett konto gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Slik fungerer det */}
      <section className="bg-warm-50 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1e1f21] mb-12">
            Slik fungerer det
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Legg ut verktøyet ditt", desc: "Legg til navn og beskrivelse. Tar 30 sekunder." },
              { step: "2", title: "Noen sender en forespørsel", desc: "En nabo sender en låneforespørsel med ønskede datoer." },
              { step: "3", title: "Gi det fra deg", desc: "Godkjenn forespørselen, møt naboen, og ferdig." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-500 font-bold flex items-center justify-center text-lg mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-[#1e1f21] mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coral-500 px-4 py-14 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Klar til å dele?
          </h2>
          <p className="text-coral-100 mb-7">
            Registrer deg gratis og legg ut ditt første verktøy på under ett minutt.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-coral-600 font-semibold px-8 py-3.5 rounded-full hover:bg-coral-50 transition-colors shadow-sm"
          >
            Kom i gang
          </Link>
        </div>
      </section>
    </div>
  );
}
