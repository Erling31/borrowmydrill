import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Ctx) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { id } = await params;
  const tool = await db.tool.findUnique({ where: { id }, select: { id: true } });
  if (!tool) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });

  // Remove the tool's borrow requests first (no ON DELETE CASCADE in schema).
  await db.$transaction([
    db.borrowRequest.deleteMany({ where: { toolId: id } }),
    db.tool.delete({ where: { id } }),
  ]);

  return new NextResponse(null, { status: 204 });
}
