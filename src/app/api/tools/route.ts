import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const tools = await db.tool.findMany({
    include: { owner: { select: { name: true, neighborhood: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tools);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to list a tool." }, { status: 401 });
  }

  const { name, description } = await request.json();
  const tool = await db.tool.create({
    data: { name, description, ownerId: session.user.id },
  });
  return NextResponse.json(tool, { status: 201 });
}
