import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/posts – fetch all posts (newest first)
export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find()
      .populate("author", "name avatar clerkId role")
      .sort({ createdAt: -1 });
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// POST /api/posts – create a new post
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find or auto-create the user document from Clerk data
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
      const role = clerkUser.publicMetadata?.role === "authority" ? "authority" : "citizen";
      user = await User.create({ clerkId: userId, name, email, avatar, role });
    }

    const body = await req.json();
    const { title, description, category, targetGroup, photo, location } = body;

    if (!title || !description || !category || !targetGroup) {
      return NextResponse.json(
        { error: "title, description, category and targetGroup are required" },
        { status: 400 },
      );
    }

    let photoUrl = "";

    // Upload photo to Cloudinary if provided
    if (photo) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        // Cloudinary not configured – skip upload, store empty
        photoUrl = "";
      } else {
        const uploadRes = await cloudinary.uploader.upload(photo, {
          folder: "sajhasamasya/posts",
          transformation: [{ width: 1080, crop: "limit" }],
        });
        photoUrl = uploadRes.secure_url;
      }
    }

    // Deadline: 24 hrs from now if targeted at authority
    const deadline =
      targetGroup === "authority" || targetGroup === "both"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : undefined;

    const post = await Post.create({
      author: user._id,
      title,
      description,
      category,
      targetGroup,
      photo: photoUrl,
      deadline,
      ...(location && {
        location: {
          address: location.address || "",
          lat: location.lat,
          lng: location.lng,
        },
      }),
    });

    // Increment issuesRaised on user
    await User.findByIdAndUpdate(user._id, {
      $inc: { issuesRaised: 1, points: 10 },
    });

    const populated = await post.populate("author", "name avatar clerkId role");

    return NextResponse.json({ post: populated }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
