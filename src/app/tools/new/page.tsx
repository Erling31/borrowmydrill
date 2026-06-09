"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

type RecognizeStatus = "idle" | "recognizing" | "filled" | "failed";

export default function NewToolPage() {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", category: "", value: "", condition: "God", visible: true });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Camera / image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recognizeStatus, setRecognizeStatus] = useState<RecognizeStatus>("idle");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin?callbackUrl=/tools/new");
  }, [status, router]);

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback((query: string) => {
    if (suggestionsTimeout.current) clearTimeout(suggestionsTimeout.current);
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestionsTimeout.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/tools/suggestions?q=${encodeURIComponent(query)}`);
        const { suggestions: list } = await res.json();
        setSuggestions(list ?? []);
        setShowSuggestions((list ?? []).length > 0);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  }, []);

  function handleNameChange(value: string) {
    setForm((f) => ({ ...f, name: value }));
    fetchSuggestions(value);
  }

  function pickSuggestion(s: string) {
    setForm((f) => ({ ...f, name: s }));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  // Camera / image handling
  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Compress with Canvas before uploading / sending to AI
    const compressed = await compressImage(file, 1024, 0.85);

    // Recognize with Claude Vision
    setRecognizeStatus("recognizing");
    try {
      const base64 = await blobToBase64(compressed);
      const mediaType = compressed.type as "image/jpeg" | "image/png" | "image/webp";
      const res = await fetch("/api/tools/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      if (res.ok) {
        const { name, description } = await res.json();
        if (name || description) {
          setForm((f) => ({
            ...f,
            name: name || f.name,
            description: description || f.description,
          }));
          setRecognizeStatus("filled");
        } else {
          setRecognizeStatus("failed");
        }
      } else {
        setRecognizeStatus("failed");
      }
    } catch {
      setRecognizeStatus("failed");
    }

    // Upload file (runs regardless of recognition result)
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", compressed, "tool.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((f) => ({ ...f, imageUrl: url }));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: form.value ? parseInt(form.value.replace(/\D/g, ""), 10) || null : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Noe gikk galt. Prøv igjen.");
      setSubmitting(false);
      return;
    }

    router.push("/tools?listed=1");
  }

  const isRecognizing = recognizeStatus === "recognizing";
  const isBusy = isRecognizing || uploading;

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-[#1e1f21] mb-5 py-1 transition-colors"
      >
        ← Tilbake til verktøy
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-[#1e1f21] mb-6">Legg ut et verktøy</h1>

        {/* Camera / image picker */}
        <div className="mb-5">
          <p className="text-sm font-medium text-zinc-700 mb-2">Bilde</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
            }}
          />

          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-warm-100">
              <Image src={imagePreview} alt="Forhåndsvisning" fill className="object-cover" />
              {isBusy && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-sm font-medium">
                    {isRecognizing ? "Analyserer verktøy…" : "Laster opp…"}
                  </p>
                </div>
              )}
              {!isBusy && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setRecognizeStatus("idle");
                    setForm((f) => ({ ...f, imageUrl: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/70"
                  aria-label="Fjern bilde"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-warm-200 rounded-xl py-6 flex flex-col items-center gap-2 text-zinc-400 hover:border-coral-300 hover:text-coral-400 transition-colors"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-sm font-medium">Ta bilde eller velg fra galleri</span>
              <span className="text-xs">AI gjenkjenner verktøyet automatisk</span>
            </button>
          )}
        </div>

        {/* AI status banners */}
        {recognizeStatus === "filled" && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            AI fylte ut navn og beskrivelse – sjekk at det stemmer
          </div>
        )}
        {recognizeStatus === "failed" && (
          <div className="mb-4 flex items-start gap-2 bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Kunne ikke gjenkjenne verktøyet automatisk. Fyll ut navn og beskrivelse manuelt.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name with autocomplete */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="tool-name">
              Navn på verktøy
            </label>
            <div className="relative">
              <input
                id="tool-name"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className={`w-full border rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors pr-9 ${
                  recognizeStatus === "filled" && form.name
                    ? "border-green-300 bg-green-50"
                    : "border-warm-200"
                }`}
                placeholder="f.eks. DeWalt drill"
                autoComplete="off"
              />
              {loadingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-warm-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onMouseDown={() => pickSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm text-zinc-700 hover:bg-warm-50 border-b border-warm-100 last:border-0 transition-colors"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Kategori
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
            >
              <option value="">Velg kategori…</option>
              {["El-verktøy", "Håndverktøy", "Hage", "Stiger", "Annet"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Beskrivelse
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`border rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors resize-none ${
                recognizeStatus === "filled" && form.description
                  ? "border-green-300 bg-green-50"
                  : "border-warm-200"
              }`}
              placeholder="Merke, tilstand, hva det passer til..."
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Verdi (kr)
              <input
                type="text"
                inputMode="numeric"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
                placeholder="f.eks. 1500"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Stand
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="border border-warm-200 rounded-xl px-3 py-3 text-base bg-warm-50 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:bg-white transition-colors"
              >
                {["Som ny", "God", "Brukt", "Slitt"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center justify-between gap-3 bg-warm-50 border border-warm-200 rounded-xl px-4 py-3.5">
            <span className="flex flex-col">
              <span className="text-sm font-medium text-zinc-700">Synlig for naboer</span>
              <span className="text-xs text-zinc-500">Vis dette verktøyet i nabolagets oversikt</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.visible}
              onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.visible ? "bg-coral-500" : "bg-warm-200"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.visible ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || isBusy}
            className="mt-1 bg-coral-500 text-white py-4 rounded-full font-semibold hover:bg-coral-600 active:bg-coral-700 transition-colors disabled:opacity-60 shadow-sm"
          >
            {submitting ? "Legger ut…" : "Legg ut verktøy"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- helpers ---

function compressImage(file: File, maxSize: number, quality: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], "tool.jpg", { type: "image/jpeg" })),
        "image/jpeg",
        quality,
      );
    };
    img.src = url;
  });
}

function blobToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
