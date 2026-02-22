import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/lib/models/Comment";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";

// GET /api/posts/[id]/comments — fetch all comments for a post
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const comments = await Comment.find({ post: id })
      .populate("author", "name avatar")
      .sort({ createdAt: 1 });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

// POST /api/posts/[id]/comments — add a comment
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

    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    const comment = await Comment.create({
      post: id,
      author: user._id,
      text: text.trim().slice(0, 500),
    });

    const populated = await comment.populate("author", "name avatar");

    return NextResponse.json({ comment: populated }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}
