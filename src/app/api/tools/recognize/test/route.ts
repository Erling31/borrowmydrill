import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

// Temporary test endpoint — remove after debugging
export async function GET() {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 64,
      messages: [{ role: "user", content: "Svar kun med: OK" }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "(no text)";
    return NextResponse.json({ ok: true, model: "claude-sonnet-4-6", response: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
