import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";

// POST /api/posts/[id]/volunteer — toggle volunteer for a post
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

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

    const { id } = await params;
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const alreadyVolunteered = post.volunteers.some(
      (vid) => vid.toString() === user._id.toString(),
    );

    let updatedPost;
    if (alreadyVolunteered) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $pull: { volunteers: user._id } },
        { new: true },
      );
      await User.findByIdAndUpdate(user._id, {
        $inc: { volunteerCount: -1 },
      });
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { volunteers: user._id } },
        { new: true },
      );
      await User.findByIdAndUpdate(user._id, {
        $inc: { volunteerCount: 1, points: 5 },
      });
    }

    return NextResponse.json({
      volunteered: !alreadyVolunteered,
      count: updatedPost.volunteers.length,
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/volunteer error:", error);
    return NextResponse.json(
      { error: "Failed to toggle volunteer" },
      { status: 500 },
    );
  }
}
