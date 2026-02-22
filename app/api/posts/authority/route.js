import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";

// GET /api/posts/authority – posts for authority dashboard (filtered by area)
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "authority") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // pending|in_progress|completed|all

    // Build query
    const query = {};

    // Apply area/category filter if authority has set their area
    const hasCategories = user.area?.categories?.length > 0;
    if (hasCategories) {
      query.category = { $in: user.area.categories };
    }

    if (statusFilter && statusFilter !== "all") {
      query.samasyaStatus = statusFilter;
    }

    const posts = await Post.find(query)
      .populate("author", "name avatar clerkId")
      .populate("respondedBy", "name")
      .sort({ createdAt: -1 });

    const now = new Date();

    // Compute stats
    const stats = {
      total: posts.length,
      pending: posts.filter((p) => p.samasyaStatus === "pending").length,
      inProgress: posts.filter((p) => p.samasyaStatus === "in_progress").length,
      completed: posts.filter((p) => p.samasyaStatus === "completed").length,
      overdue: posts.filter(
        (p) =>
          p.samasyaStatus !== "completed" &&
          p.deadline &&
          new Date(p.deadline) < now,
      ).length,
    };

    return NextResponse.json({ posts, stats, authority: user });
  } catch (error) {
    console.error("GET /api/posts/authority error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
