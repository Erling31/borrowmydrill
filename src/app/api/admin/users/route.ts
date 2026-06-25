import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      neighborhood: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { tools: true, requests: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { email, password, name, neighborhood, isAdmin } = await request.json();

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
  const user = await db.user.create({
    data: { email, passwordHash, name, neighborhood, isAdmin: !!isAdmin },
    select: { id: true, email: true, name: true, neighborhood: true, isAdmin: true },
  });

  return NextResponse.json(user, { status: 201 });
}
