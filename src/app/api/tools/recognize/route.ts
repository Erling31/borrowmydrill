import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

const TONE_INSTRUCTIONS: Record<string, string> = {
  kort: "Skriv beskrivelsen kort og presist — maks én kort setning, uten fyllord.",
  teknisk: "Skriv beskrivelsen teknisk — fokuser på modell, spesifikasjoner og tekniske egenskaper hvis du kan utlede dem.",
  vennlig: "Skriv beskrivelsen i en avslappet, vennlig nabotone — som om du forklarer det til en venn.",
};

export async function POST(request: Request) {
  const { imageBase64, mediaType } = await request.json();

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Mangler bilde" }, { status: 400 });
  }

  // Look up the user's preferred AI tone (defaults to "vennlig")
  let tone = "vennlig";
  try {
    const session = await auth();
    if (session?.user?.id) {
      const user = await db.user.findUnique({ where: { id: session.user.id }, select: { aiTone: true } });
      if (user?.aiTone) tone = user.aiTone;
    }
  } catch {
    // fall back to default tone
  }
  const toneInstruction = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.vennlig;

  let raw = "";
  try {
    const prompt = `Du er en ekspert på verktøy og utstyr. Se på bildet og identifiser verktøyet.

Svar KUN med et JSON-objekt med disse feltene (ingen annen tekst, ingen kodeblokker):
{
  "name": "Fullt navn med merke og modell hvis synlig (f.eks. 'DeWalt DCD796 18V drill')",
  "category": "Én av: El-verktøy, Håndverktøy, Hage, Stiger, Annet",
  "description": "Norsk beskrivelse. ${toneInstruction}"
}

Hvis du er usikker på merke/modell, skriv hva slags verktøy det er (f.eks. "Sirkelsag" eller "Høytrykkspyler").`;

    const result = await genai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
            { text: prompt },
          ],
        },
      ],
    });

    raw = result.text ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("recognize: Gemini API error:", msg);
    return NextResponse.json({ error: "AI-tjenesten er utilgjengelig", detail: msg }, { status: 502 });
  }

  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    const result = JSON.parse(json);
    return NextResponse.json(result);
  } catch {
    console.error("recognize: failed to parse Claude response:", raw);
    // Return the raw text as description so the user still gets something useful
    const fallback = raw.trim();
    if (fallback) {
      return NextResponse.json({ name: "", category: "", description: fallback });
    }
    return NextResponse.json({ error: "Kunne ikke gjenkjenne verktøyet" }, { status: 422 });
  }
}
