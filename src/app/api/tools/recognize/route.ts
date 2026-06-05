import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

export async function POST(request: Request) {
  const { imageBase64, mediaType } = await request.json();

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Mangler bilde" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
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
            text: `Identifiser verktøyet på bildet.
Svar KUN med en JSON-objekt med disse feltene:
- "name": Fullt navn med merke og modell (f.eks. "DeWalt DCD796 18V børsteløs drill")
- "description": Kort norsk beskrivelse (1-2 setninger om hva verktøyet er og passer til)

Kun JSON, ingen annen tekst.`,
          },
        ],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  // Strip markdown code fences Claude sometimes adds despite instructions
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    const result = JSON.parse(json);
    return NextResponse.json(result);
  } catch {
    console.error("recognize: failed to parse Claude response:", raw);
    return NextResponse.json({ error: "Kunne ikke gjenkjenne verktøyet" }, { status: 422 });
  }
}
