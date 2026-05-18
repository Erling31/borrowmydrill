import { NextResponse } from "next/server";

// Placeholder — replace with database reads/writes (e.g. Prisma)
const tools: object[] = [];

export async function GET() {
  return NextResponse.json(tools);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tool = { id: Date.now().toString(), ...body, available: true, createdAt: new Date() };
  tools.push(tool);
  return NextResponse.json(tool, { status: 201 });
}
