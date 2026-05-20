"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", neighborhood: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "Noe gikk galt. Prøv igjen.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/tools");
    router.refresh();
  }

  return (
    <div className="flex items-start sm:items-center justify-center min-h-[calc(100dvh-3.5rem)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-[#1e1f21]">Opprett konto</h1>
          <p className="text-zinc-500 mt-1 text-sm">Gratis – klar på under ett minutt</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Navn
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
                placeholder="f.eks. Maria S."
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              E-post
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
                placeholder="deg@eksempel.no"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Passord
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
                placeholder="Minst 8 tegn"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Nabolag / gate
              <input
                required
                autoComplete="address-level2"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
                placeholder="f.eks. Ekebergveien"
              />
            </label>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-coral-500 text-white py-4 rounded-full font-semibold hover:bg-coral-600 active:bg-coral-700 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? "Oppretter konto…" : "Opprett konto"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Har du allerede konto?{" "}
          <Link href="/auth/signin" className="text-coral-500 font-semibold hover:underline">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  );
}
