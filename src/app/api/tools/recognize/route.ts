import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Du er en ekspert på verktøy og utstyr. Se på bildet og identifiser verktøyet.

Svar KUN med et JSON-objekt med disse feltene (ingen annen tekst, ingen kodeblokker):
{
  "name": "Fullt navn med merke og modell hvis synlig (f.eks. 'DeWalt DCD796 18V drill')",
  "category": "Én av: El-verktøy, Håndverktøy, Hage, Stiger, Annet",
  "description": "Norsk beskrivelse. ${toneInstruction}"
}

Hvis du er usikker på merke/modell, skriv hva slags verktøy det er (f.eks. "Sirkelsag" eller "Høytrykkspyler").`,
          },
        ],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    const result = JSON.parse(json);
    return NextResponse.json(result);
  } catch {
    console.error("recognize: failed to parse Claude response:", raw);
    return NextResponse.json({ error: "Kunne ikke gjenkjenne verktøyet" }, { status: 422 });
  }
}
