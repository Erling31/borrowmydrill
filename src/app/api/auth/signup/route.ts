import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { email, password, name, neighborhood } = await request.json();

  if (!email || !password || !name || !neighborhood) {
    return NextResponse.json({ error: "Alle felt må fylles ut." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Passordet må være minst 8 tegn." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Det finnes allerede en konto med denne e-postadressen." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { email, passwordHash, name, neighborhood } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
