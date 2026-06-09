"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const TONES = [
  {
    id: "kort",
    label: "Kort",
    desc: "Korte, presise beskrivelser uten fyllord.",
    sample: "DeWalt drill. 18V, børsteløs motor. God til de fleste boreoppgaver.",
  },
  {
    id: "teknisk",
    label: "Teknisk",
    desc: "Vekt på spesifikasjoner, modell og tekniske detaljer.",
    sample: "DeWalt DCD796 18V børsteløs slagtrekker, 2-girs girkasse, maks dreiemoment 70 Nm.",
  },
  {
    id: "vennlig",
    label: "Vennlig",
    desc: "Avslappet, naboaktig tone — som å forklare det til en venn.",
    sample: "En pålitelig liten drill som takler det meste rundt huset — perfekt å låne bort!",
  },
];

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", accent: "#3f7d52",
  accentSoft: "#e4efe5", accentInk: "#143524",
};

export default function InnstillingerPage() {
  const router = useRouter();
  const { status } = useSession();
  const [tone, setTone] = useState<string>("vennlig");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/innstillinger");
      return;
    }
    if (status !== "authenticated") return;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.aiTone) setTone(data.aiTone);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, router]);

  async function pickTone(id: string) {
    if (id === tone || saving) return;
    setTone(id);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiTone: id }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) return null;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: T.surface, padding: "16px 16px 12px", borderBottom: `1px solid ${T.hair}` }}>
        <Link href="/" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>
          ← Tilbake
        </Link>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text, marginTop: 6 }}>
          Innstillinger
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 4 }}>AI-beskrivelser</div>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 14, lineHeight: 1.5 }}>
          Velg hvilken tone AI-en skal bruke når den foreslår navn og beskrivelse for verktøyene dine.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TONES.map((t) => {
            const active = tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTone(t.id)}
                style={{
                  textAlign: "left",
                  background: active ? T.accentSoft : T.surface,
                  border: `1px solid ${active ? "transparent" : T.hair}`,
                  borderRadius: 14,
                  padding: 14,
                  cursor: "pointer",
                  boxShadow: active ? "none" : "0 1px 2px rgba(20,22,18,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5, color: active ? T.accentInk : T.text }}>
                    {t.label}
                  </span>
                  <span
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${active ? T.accent : T.hair}`,
                      background: active ? T.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {active && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5 10 17l9-10" />
                      </svg>
                    )}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: active ? T.accentInk : T.muted, marginTop: 4, lineHeight: 1.45, opacity: active ? 0.85 : 1 }}>
                  {t.desc}
                </p>
                <div
                  style={{
                    marginTop: 10, fontSize: 12, fontStyle: "italic", lineHeight: 1.5,
                    color: active ? T.accentInk : T.muted,
                    background: active ? "rgba(255,255,255,0.5)" : T.bg,
                    borderRadius: 10, padding: "8px 10px",
                  }}
                >
                  &ldquo;{t.sample}&rdquo;
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, fontSize: 12.5, color: T.muted, minHeight: 18 }}>
          {saving ? "Lagrer…" : saved ? "✓ Lagret" : " "}
        </div>
      </div>
    </div>
  );
}
