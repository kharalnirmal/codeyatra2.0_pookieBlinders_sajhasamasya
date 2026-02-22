import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import { BADGE_DEFS, computeNewBadges, getBadgeDefsForRole } from "@/lib/badges";

// GET /api/user/profile – current user's full profile with stats, badges, recent posts
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find or auto-create user
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "User";
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const avatar = clerkUser.imageUrl || "";
      const role =
        clerkUser.publicMetadata?.role === "authority"
          ? "authority"
          : "citizen";
      user = await User.create({ clerkId: userId, name, email, avatar, role });
    }

    // Award any newly earned badges
    const newBadges = computeNewBadges(user);
    if (newBadges.length > 0) {
      user = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { badges: { $each: newBadges } } },
        { new: true },
      );
    }

    // Fetch user's recent posts (latest 10)
    const recentPosts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title category samasyaStatus createdAt photo");

    // Build full badge list (earned + locked)
    const earnedSet = new Set(user.badges || []);
    const badgeDefs = getBadgeDefsForRole(user.role);
    const allBadges = badgeDefs.map((b) => ({
      ...b,
      earned: earnedSet.has(b.id),
      check: undefined, // don't expose function to client
    }));

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        points: user.points,
        badges: user.badges,
        issuesRaised: user.issuesRaised,
        issuesSolved: user.issuesSolved,
        volunteerCount: user.volunteerCount,
        rating: user.rating,
        totalResolved: user.totalResolved,
        totalIgnored: user.totalIgnored,
        area: user.area,
        createdAt: user.createdAt,
      },
      allBadges,
      recentPosts,
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}
