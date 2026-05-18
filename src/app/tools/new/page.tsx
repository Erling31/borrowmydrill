"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewToolPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", neighborhood: "", ownerName: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/tools?listed=1");
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/tools" className="text-sm text-zinc-500 hover:text-zinc-700 mb-6 inline-block">
        ← Back to tools
      </Link>
      <div className="bg-white rounded-2xl border border-zinc-200 p-8">
        <h1 className="text-xl font-bold mb-6">List a Tool</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Tool name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. DeWalt Cordless Drill"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Description
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Brand, condition, what it's good for..."
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Your name
            <input
              required
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Maria S."
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Neighborhood / street
            <input
              required
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Oak Street"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-orange-600 text-white py-3 rounded-full font-medium hover:bg-orange-700 transition-colors disabled:opacity-60"
          >
            {submitting ? "Listing…" : "List My Tool"}
          </button>
        </form>
      </div>
    </div>
  );
}
