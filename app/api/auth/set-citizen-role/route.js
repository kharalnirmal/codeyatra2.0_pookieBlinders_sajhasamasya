import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Only set role if not already set (don't overwrite authority role)
    if (user.publicMetadata?.role) {
      return NextResponse.json({
        ok: true,
        role: user.publicMetadata.role,
        message: "Role already set",
      });
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "citizen" },
    });

    return NextResponse.json({ ok: true, role: "citizen" });
  } catch (error) {
    console.error("set-citizen-role error:", error);
    return NextResponse.json(
      { error: "Failed to set citizen role" },
      { status: 500 },
    );
  }
}
