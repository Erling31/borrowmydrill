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
      <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
        <h1 className="text-xl font-bold mb-1">Velkommen tilbake</h1>
        <p className="text-sm text-zinc-500 mb-6">Logg inn på din BorrowMyDrill-konto</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            E-post
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
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
              className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-orange-600 text-white py-4 rounded-full font-medium hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-60 text-base"
          >
            {loading ? "Logger inn…" : "Logg inn"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Har du ikke konto?{" "}
          <Link href="/auth/signup" className="text-orange-600 font-medium hover:underline">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  );
}
