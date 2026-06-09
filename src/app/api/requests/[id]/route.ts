import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

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
    include: { tool: { include: { owner: { select: { id: true, name: true } } } }, user: { select: { id: true, name: true } } },
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

  const toolName = borrowRequest.tool.name;
  const ownerFirst = borrowRequest.tool.owner.name?.split(" ")[0] ?? "Eier";
  const borrowerFirst = borrowRequest.user.name?.split(" ")[0] ?? "Låner";

  if (status === "approved") {
    await notify(borrowRequest.userId, "approved", `${ownerFirst} godtok lånet`, `${toolName} — klar til henting`, `/tools/${borrowRequest.toolId}`);
  } else if (status === "rejected") {
    await notify(borrowRequest.userId, "rejected", `${ownerFirst} avslo forespørselen`, `${toolName} er ikke tilgjengelig denne gangen`, `/tools/${borrowRequest.toolId}`);
  } else if (status === "returned") {
    const notifyUserId = isOwner ? borrowRequest.userId : borrowRequest.tool.ownerId;
    const who = isOwner ? ownerFirst : borrowerFirst;
    await notify(notifyUserId, "returned", `${who} bekreftet retur`, `${toolName} er registrert som returnert`, `/tools/${borrowRequest.toolId}`);
  }

  return NextResponse.json(updated);
}
