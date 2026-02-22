import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        error: "Not signed in",
        userId: null,
        role: null,
      });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return NextResponse.json({
      userId,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
      publicMetadata: user.publicMetadata,
      role: user.publicMetadata?.role ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
