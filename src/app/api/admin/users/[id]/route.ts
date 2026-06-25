import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Ctx) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { id } = await params;

  if (id === adminId) {
    return NextResponse.json({ error: "Du kan ikke slette din egen konto." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });

  // Cascade delete: remove all rows that reference this user before the user
  // itself, since the schema has no ON DELETE CASCADE.
  await db.$transaction([
    // Requests this user sent on others' tools
    db.borrowRequest.deleteMany({ where: { userId: id } }),
    // Requests from anyone on this user's tools
    db.borrowRequest.deleteMany({ where: { tool: { ownerId: id } } }),
    // This user's notifications
    db.notification.deleteMany({ where: { userId: id } }),
    // This user's tools
    db.tool.deleteMany({ where: { ownerId: id } }),
    // Finally the user
    db.user.delete({ where: { id } }),
  ]);

  return new NextResponse(null, { status: 204 });
}
