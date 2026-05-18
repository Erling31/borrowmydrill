"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", message: "", startDate: "", endDate: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId: id, ...form }),
    });
    router.push(`/tools/${id}?requested=1`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href={`/tools/${id}`} className="text-sm text-zinc-500 hover:text-zinc-700 mb-6 inline-block">
        ← Back to tool
      </Link>
      <div className="bg-white rounded-2xl border border-zinc-200 p-8">
        <h1 className="text-xl font-bold mb-6">Request to Borrow</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Your name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Alex Johnson"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              From
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              To
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            What are you working on? (optional)
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Building a deck, hanging shelves..."
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-orange-600 text-white py-3 rounded-full font-medium hover:bg-orange-700 transition-colors disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
