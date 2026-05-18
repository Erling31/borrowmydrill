import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const requests = await db.borrowRequest.findMany({
    include: { tool: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const { toolId, name, message, startDate, endDate } = await request.json();
  const borrowRequest = await db.borrowRequest.create({
    data: {
      toolId,
      name,
      message,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
  return NextResponse.json(borrowRequest, { status: 201 });
}
