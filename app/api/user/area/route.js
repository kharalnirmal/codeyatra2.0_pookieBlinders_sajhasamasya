import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// PATCH /api/user/area – authority updates their coverage area
export async function PATCH(req) {
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

    const { districts, categories } = await req.json();

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        "area.districts": Array.isArray(districts) ? districts : [],
        "area.categories": Array.isArray(categories) ? categories : [],
      },
      { new: true },
    );

    return NextResponse.json({
      area: updated.area,
    });
  } catch (error) {
    console.error("PATCH /api/user/area error:", error);
    return NextResponse.json(
      { error: "Failed to update area" },
      { status: 500 },
    );
  }
}
