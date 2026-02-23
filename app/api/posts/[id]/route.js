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

// GET /api/posts/[id] – fetch a single post
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id).populate(
      "author",
      "name avatar clerkId role",
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}

// PUT /api/posts/[id] – update (edit) a post
export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only the author or an authority can edit
    if (
      post.author.toString() !== user._id.toString() &&
      user.role !== "authority"
    ) {
      return NextResponse.json(
        { error: "Forbidden – you can only edit your own posts" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      targetGroup,
      photo,
      location,
      district,
    } = body;

    const update = {};
    if (title) update.title = title;
    if (description) update.description = description;
    if (category) update.category = category;
    if (targetGroup) update.targetGroup = targetGroup;
    if (district !== undefined) update.district = district;

    if (location) {
      update.location = {
        address: location.address || "",
        lat: location.lat,
        lng: location.lng,
      };
    }

    // If a new photo is provided (base64), upload to Cloudinary
    if (photo && photo.startsWith("data:")) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        const uploadRes = await cloudinary.uploader.upload(photo, {
          folder: "sajhasamasya/posts",
          transformation: [{ width: 1080, crop: "limit" }],
        });
        update.photo = uploadRes.secure_url;
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("author", "name avatar clerkId role");

    return NextResponse.json({ post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}

// DELETE /api/posts/[id] – delete a post
export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only the author (or an authority) can delete
    if (
      post.author.toString() !== user._id.toString() &&
      user.role !== "authority"
    ) {
      return NextResponse.json(
        { error: "Forbidden – you can only delete your own posts" },
        { status: 403 },
      );
    }

    await Post.findByIdAndDelete(id);

    // Decrement issuesRaised on the original author
    await User.findByIdAndUpdate(post.author, {
      $inc: { issuesRaised: -1 },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
