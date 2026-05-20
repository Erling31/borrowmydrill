"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Feil e-post eller passord.");
      setLoading(false);
    } else {
      router.push("/tools");
      router.refresh();
    }
  }

  return (
    <div className="flex items-start sm:items-center justify-center min-h-[calc(100dvh-3.5rem)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-[#1e1f21]">Velkommen tilbake</h1>
          <p className="text-zinc-500 mt-1 text-sm">Logg inn på din BorrowMyDrill-konto</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
                placeholder="••••••••"
              />
            </label>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-coral-500 text-white py-4 rounded-full font-semibold hover:bg-coral-600 active:bg-coral-700 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? "Logger inn…" : "Logg inn"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Har du ikke konto?{" "}
          <Link href="/auth/signup" className="text-coral-500 font-semibold hover:underline">
            Registrer deg gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
