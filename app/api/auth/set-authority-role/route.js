import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "authority",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.errors?.[0]?.message || "Failed to set authority role",
      },
      { status: 500 },
    );
  }
}
