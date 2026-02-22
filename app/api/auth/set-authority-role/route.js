import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { secretCode, userId: bodyUserId } = body || {};

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

    // Resolve userId: prefer explicit body param (upgrade page),
    // fall back to session token in Authorization header (sign-up flow after setActive).
    let userId = bodyUserId;
    if (!userId) {
      const { userId: sessionUserId } = await auth();
      userId = sessionUserId;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Could not identify user. Please sign in and try again." },
        { status: 401 },
      );
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "authority" },
    });

    // Verify the update actually took effect
    const updated = await client.users.getUser(userId);
    const confirmedRole = updated.publicMetadata?.role;
    if (confirmedRole !== "authority") {
      return NextResponse.json(
        { error: "Role update failed to persist in Clerk." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, userId, role: confirmedRole });
  } catch (error) {
    console.error("set-authority-role error:", error);
    return NextResponse.json(
      {
        error: error?.errors?.[0]?.message || error?.message || "Failed to set authority role",
      },
      { status: 500 },
    );
  }
}
