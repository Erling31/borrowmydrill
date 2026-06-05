"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  requestId: string;
  showReturn?: boolean;
}

export default function RequestActions({ requestId, showReturn = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  }

  if (showReturn) {
    return (
      <button
        onClick={() => updateStatus("returned")}
        disabled={!!loading}
        className="w-full bg-coral-500 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-coral-600 active:bg-coral-700 transition-colors disabled:opacity-60"
      >
        {loading === "returned" ? "Registrerer…" : "Markér som returnert"}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("rejected")}
        disabled={!!loading}
        className="flex-1 border border-warm-200 text-zinc-600 py-2.5 rounded-full text-sm font-semibold hover:bg-warm-50 transition-colors disabled:opacity-60"
      >
        {loading === "rejected" ? "…" : "Avslå"}
      </button>
      <button
        onClick={() => updateStatus("approved")}
        disabled={!!loading}
        className="flex-[2] bg-coral-500 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-coral-600 active:bg-coral-700 transition-colors disabled:opacity-60"
      >
        {loading === "approved" ? "Godkjenner…" : "Godta"}
      </button>
    </div>
  );
}
