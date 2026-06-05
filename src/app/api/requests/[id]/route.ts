import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const borrowRequest = await db.borrowRequest.findUnique({
    where: { id },
    include: { tool: true },
  });
  if (!borrowRequest) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  const isOwner = borrowRequest.tool.ownerId === session.user.id;
  const isBorrower = borrowRequest.userId === session.user.id;

  // Owner can approve/reject, borrower can mark returned
  if (status === "approved" || status === "rejected") {
    if (!isOwner) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  } else if (status === "returned") {
    if (!isOwner && !isBorrower) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  // Update request status and tool availability in a transaction
  const [updated] = await db.$transaction([
    db.borrowRequest.update({ where: { id }, data: { status } }),
    status === "approved"
      ? db.tool.update({ where: { id: borrowRequest.toolId }, data: { available: false } })
      : status === "returned" || status === "rejected"
      ? db.tool.update({ where: { id: borrowRequest.toolId }, data: { available: true } })
      : db.tool.findUnique({ where: { id: borrowRequest.toolId } }), // no-op query
  ]);

  return NextResponse.json(updated);
}
