"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const T = { accent: "#3f7d52", accentInk: "#143524", surface: "#ffffff", hair: "#e8e9e4", muted: "#71756d" };

const btnBase: React.CSSProperties = {
  flex: 1, padding: "8px 12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
  letterSpacing: "-0.01em", textAlign: "center", border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

interface Props { requestId: string; showReturn?: boolean; }

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
        style={{ ...btnBase, flex: "unset", width: "100%", background: T.accent, color: T.accentInk, boxShadow: `0 6px 16px -8px ${T.accent}`, opacity: loading ? 0.6 : 1 }}
      >
        {loading === "returned" ? "Registrerer…" : "Markér som returnert"}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => updateStatus("rejected")}
        disabled={!!loading}
        style={{ ...btnBase, background: T.surface, color: T.muted, border: `1px solid ${T.hair}`, opacity: loading ? 0.6 : 1 }}
      >
        {loading === "rejected" ? "…" : "Avslå"}
      </button>
      <button
        onClick={() => updateStatus("approved")}
        disabled={!!loading}
        style={{ ...btnBase, flex: 2, background: T.accent, color: T.accentInk, boxShadow: `0 6px 16px -8px ${T.accent}`, opacity: loading ? 0.6 : 1 }}
      >
        {loading === "approved" ? "Godkjenner…" : "Godta"}
      </button>
    </div>
  );
}
