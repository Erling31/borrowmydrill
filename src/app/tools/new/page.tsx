"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function NewToolPage() {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "unauthenticated") {
    router.replace("/auth/signin?callbackUrl=/tools/new");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Noe gikk galt. Prøv igjen.");
      setSubmitting(false);
      return;
    }

    router.push("/tools?listed=1");
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5 py-1">
        ← Tilbake til verktøy
      </Link>
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-8">
        <h1 className="text-xl font-bold mb-5">Legg ut et verktøy</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Navn på verktøy
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="f.eks. DeWalt drill"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Beskrivelse
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Merke, tilstand, hva det passer til..."
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 bg-orange-600 text-white py-4 rounded-full font-medium hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-60 text-base"
          >
            {submitting ? "Legger ut…" : "Legg ut verktøy"}
          </button>
        </form>
      </div>
    </div>
  );
}
