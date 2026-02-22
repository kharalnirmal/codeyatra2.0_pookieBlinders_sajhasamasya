import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { computeNewBadges } from "@/lib/badges";

// PATCH /api/posts/[id]/status  – authority updates post status
export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find or auto-create authority user
    let authorityUser = await User.findOne({ clerkId: userId });
    if (!authorityUser) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        "Authority";
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const avatar = clerkUser.imageUrl || "";
      authorityUser = await User.create({
        clerkId: userId,
        name,
        email,
        avatar,
        role: "authority",
      });
    }

    if (authorityUser.role !== "authority") {
      return NextResponse.json(
        { error: "Forbidden – authority only" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const { status, response } = await req.json();

    const validStatuses = ["pending", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const now = new Date();
    const wasCompleted = post.samasyaStatus === "completed";

    // Build update payload
    const update = {
      samasyaStatus: status,
      respondedBy: authorityUser._id,
      respondedAt: now,
    };
    if (response) update.authorityResponse = response;

    const updatedPost = await Post.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("author", "name avatar clerkId role");

    // ── Rating & stats logic ──
    if (status === "completed" && !wasCompleted) {
      const isLate = post.deadline && now > post.deadline;

      // Deduct rating if resolved late, else give small boost
      let ratingDelta = isLate ? -0.3 : 0.1;
      let newRating = Math.min(
        5,
        Math.max(0, authorityUser.rating + ratingDelta),
      );

      await User.findByIdAndUpdate(authorityUser._id, {
        $inc: { totalResolved: 1, issuesSolved: 1, points: 15 },
        rating: parseFloat(newRating.toFixed(1)),
      });

      // Update citizien's issuesSolved
      if (post.author) {
        await User.findByIdAndUpdate(post.author, {
          $inc: { issuesSolved: 1, points: 5 },
        });
        // Award badges for the citizen
        const citizen = await User.findById(post.author);
        if (citizen) {
          const newBadges = computeNewBadges(citizen);
          if (newBadges.length > 0) {
            await User.findByIdAndUpdate(citizen._id, {
              $addToSet: { badges: { $each: newBadges } },
            });
          }
        }
      }
    }

    // If deadline passed and authority is only now responding (in_progress), small rating hit
    if (
      status === "in_progress" &&
      post.deadline &&
      now > post.deadline &&
      post.samasyaStatus === "pending"
    ) {
      const newRating = Math.max(
        0,
        parseFloat((authorityUser.rating - 0.1).toFixed(1)),
      );
      await User.findByIdAndUpdate(authorityUser._id, { rating: newRating });
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("PATCH /api/posts/[id]/status error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
