import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Ingen fil" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json({ error: "Kun JPEG, PNG og WebP er tillatt" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Filen er for stor (maks 5 MB)" }, { status: 400 });
  }

  // Every upload is named "tool.jpg" by the client — a random suffix is
  // required so uploads don't collide (Blob refuses to overwrite by default).
  const blob = await put(file.name, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
