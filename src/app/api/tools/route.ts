import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tools = await db.tool.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tools);
}

export async function POST(request: Request) {
  const { name, description, ownerName, neighborhood } = await request.json();
  const tool = await db.tool.create({
    data: { name, description, ownerName, neighborhood },
  });
  return NextResponse.json(tool, { status: 201 });
}
