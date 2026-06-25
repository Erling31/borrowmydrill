import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const tools = await db.tool.findMany({
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tools);
}

export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { ownerId, name, description, category, condition } = await request.json();

  if (!ownerId || !name || !description) {
    return NextResponse.json({ error: "Eier, navn og beskrivelse må fylles ut." }, { status: 400 });
  }

  const owner = await db.user.findUnique({ where: { id: ownerId }, select: { id: true } });
  if (!owner) return NextResponse.json({ error: "Ugyldig eier." }, { status: 400 });

  const tool = await db.tool.create({
    data: {
      name,
      description,
      category: category || null,
      condition: condition || "God",
      ownerId,
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(tool, { status: 201 });
}
