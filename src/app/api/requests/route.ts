import { NextResponse } from "next/server";

// Placeholder — replace with database reads/writes (e.g. Prisma)
const requests: object[] = [];

export async function GET() {
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const borrowRequest = { id: Date.now().toString(), ...body, status: "pending", createdAt: new Date() };
  requests.push(borrowRequest);
  return NextResponse.json(borrowRequest, { status: 201 });
}
