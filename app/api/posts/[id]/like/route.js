import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";

// POST /api/posts/[id]/like — toggle like/unlike
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

    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === user._id.toString(),
    );

    let updatedPost;
    if (alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: user._id } },
        { new: true },
      );
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likes: user._id } },
        { new: true },
      );
    }

    return NextResponse.json({
      liked: !alreadyLiked,
      count: updatedPost.likes.length,
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 },
    );
  }
}
