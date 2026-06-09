import { NextResponse } from "next/server";

// Category → palette
const PALETTES: Record<string, { bg1: string; bg2: string; icon: string }> = {
  "El-verktøy":  { bg1: "#2d6b45", bg2: "#1a4a2e", icon: "⚡" },
  "Hage":        { bg1: "#4a7c2f", bg2: "#2e5218", icon: "🌿" },
  "Stiger":      { bg1: "#7a6520", bg2: "#4f4012", icon: "🪜" },
  "Håndverktøy": { bg1: "#4a5e6a", bg2: "#2e3e47", icon: "🔩" },
  "Annet":       { bg1: "#5a5a5a", bg2: "#3a3a3a", icon: "🔧" },
};

// Tool-specific emojis (matched by keyword in name)
const KEYWORDS: [string, string][] = [
  ["drill", "🔩"], ["boring", "🔩"], ["slagboer", "🔩"], ["pinole", "🔩"],
  ["sag", "🪚"], ["stikksag", "🪚"], ["kapp", "🪚"], ["sirkelsag", "🪚"],
  ["sliper", "🪛"], ["vinkelsliper", "🪛"],
  ["høytrykkspyler", "💧"], ["kärcher", "💧"], ["spyler", "💧"],
  ["gressklipper", "🌿"], ["klipper", "✂️"],
  ["kompostkvernen", "🌱"], ["hagesaks", "✂️"], ["hagepumpe", "💧"],
  ["betongblander", "🏗️"], ["strømaggregat", "⚡"],
  ["stige", "🪜"],
  ["tapetbord", "📋"],
];

function pickEmoji(name: string, cat: string): string {
  const lower = name.toLowerCase();
  for (const [kw, em] of KEYWORDS) {
    if (lower.includes(kw)) return em;
  }
  return PALETTES[cat]?.icon ?? "🔧";
}

function makeSvg(name: string, cat: string): string {
  const p = PALETTES[cat] ?? PALETTES["Annet"];
  const emoji = pickEmoji(name, cat);

  // Truncate long names for display
  const displayName = name.length > 28 ? name.slice(0, 26) + "…" : name;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}"/>
      <stop offset="100%" stop-color="${p.bg2}"/>
    </linearGradient>
    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.03)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.0)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="450" fill="url(#bg)"/>
  <rect width="800" height="450" fill="url(#shimmer)"/>

  <!-- Subtle grid pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  </pattern>
  <rect width="800" height="450" fill="url(#grid)"/>

  <!-- Decorative circle -->
  <circle cx="640" cy="80" r="180" fill="rgba(255,255,255,0.04)"/>
  <circle cx="640" cy="80" r="120" fill="rgba(255,255,255,0.04)"/>

  <!-- Emoji -->
  <text x="400" y="230" font-size="110" text-anchor="middle" dominant-baseline="middle">${emoji}</text>

  <!-- Tool name -->
  <text x="400" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="28"
    font-weight="700" fill="rgba(255,255,255,0.92)" text-anchor="middle" letter-spacing="-0.5">${displayName}</text>

  <!-- Category tag -->
  <rect x="330" y="368" width="${cat.length * 9 + 24}" height="28" rx="14" fill="rgba(255,255,255,0.15)"/>
  <text x="342" y="387" font-family="system-ui, -apple-system, sans-serif" font-size="13"
    font-weight="600" fill="rgba(255,255,255,0.80)">${cat}</text>
</svg>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "Verktøy";
  const cat = searchParams.get("cat") ?? "Annet";

  const svg = makeSvg(name, cat);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
