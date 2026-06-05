import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Du er en assistent som hjelper folk med å identifisere nøyaktige verktøymodeller.
Brukeren skriver: "${query}"

Svar med en JSON-array med opptil 4 konkrete verktøymodeller på norsk (inkluder merke, modellnavn og nøkkelspesifikasjoner).
Svar KUN med en JSON-array, ingen annen tekst. Eksempel: ["DeWalt DCD796 18V børsteløs drill", "DeWalt DCD778 18V kompakt drill"]`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    const suggestions = JSON.parse(json);
    return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions : [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
