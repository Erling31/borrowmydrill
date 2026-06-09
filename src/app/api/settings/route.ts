import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_TONES = ["kort", "teknisk", "vennlig"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { aiTone: true },
  });
  return NextResponse.json({ aiTone: user?.aiTone ?? "vennlig" });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { aiTone } = await request.json();
  if (!VALID_TONES.includes(aiTone)) {
    return NextResponse.json({ error: "Ugyldig tone" }, { status: 400 });
  }

  await db.user.update({ where: { id: session.user.id }, data: { aiTone } });
  return NextResponse.json({ ok: true, aiTone });
}
