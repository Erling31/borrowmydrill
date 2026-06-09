import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const tool = await db.tool.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, neighborhood: true } } },
  });
  if (!tool) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  return NextResponse.json(tool);
}

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;
  const tool = await db.tool.findUnique({ where: { id } });
  if (!tool) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  if (tool.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const { name, description, imageUrl, available, category, value, condition, visible } = await request.json();
  const updated = await db.tool.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(available !== undefined && { available }),
      ...(category !== undefined && { category }),
      ...(value !== undefined && { value }),
      ...(condition !== undefined && { condition }),
      ...(visible !== undefined && { visible }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;
  const tool = await db.tool.findUnique({ where: { id } });
  if (!tool) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  if (tool.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  await db.tool.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
