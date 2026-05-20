"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { use } from "react";

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState({ message: "", startDate: "", endDate: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "unauthenticated") {
    router.replace(`/auth/signin?callbackUrl=/tools/${id}/request`);
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId: id, ...form }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Noe gikk galt. Prøv igjen.");
      setSubmitting(false);
      return;
    }

    router.push(`/tools/${id}?requested=1`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href={`/tools/${id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5 py-1">
        ← Tilbake til verktøy
      </Link>
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-8">
        <h1 className="text-xl font-bold mb-5">Send låneforespørsel</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Fra
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Til
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Hva skal du bruke det til? (valgfritt)
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="border border-zinc-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Bygge terrasse, henge opp hyller..."
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 bg-orange-600 text-white py-4 rounded-full font-medium hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-60 text-base"
          >
            {submitting ? "Sender…" : "Send forespørsel"}
          </button>
        </form>
      </div>
    </div>
  );
}
