import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { secretCode } = body || {};

    if (!secretCode) {
      return NextResponse.json(
        { error: "Secret code is required" },
        { status: 400 },
      );
    }

    if (!process.env.AUTHORITY_SECRET_CODE) {
      return NextResponse.json(
        { error: "Server is missing AUTHORITY_SECRET_CODE" },
        { status: 500 },
      );
    }

    if (secretCode !== process.env.AUTHORITY_SECRET_CODE) {
      return NextResponse.json(
        { error: "Invalid authority code" },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
