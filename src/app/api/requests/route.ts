import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

export async function GET() {
  const requests = await db.borrowRequest.findMany({
    include: { tool: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to request a tool." }, { status: 401 });
  }

  const { toolId, message, startDate, endDate } = await request.json();
  const borrowRequest = await db.borrowRequest.create({
    data: {
      toolId,
      userId: session.user.id,
      message,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
    include: { tool: { include: { owner: true } }, user: { select: { name: true } } },
  });

  const firstName = borrowRequest.user.name?.split(" ")[0] ?? "En nabo";
  await notify(
    borrowRequest.tool.ownerId,
    "request",
    `Ny forespørsel fra ${firstName}`,
    `${firstName} vil låne ${borrowRequest.tool.name.toLowerCase()}`,
    `/tools/${borrowRequest.toolId}`,
  );

  return NextResponse.json(borrowRequest, { status: 201 });
}
