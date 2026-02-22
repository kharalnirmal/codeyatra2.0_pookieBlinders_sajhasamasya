import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, default: "" },
    location: {
      address: { type: String, default: "" },
      lat: { type: Number },
      lng: { type: Number },
    },
    category: {
      type: String,
      enum: ["road", "water", "electricity", "garbage", "safety", "other"],
      required: true,
    },
    samasyaStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    targetGroup: {
      type: String,
      enum: ["volunteer", "authority", "both"],
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Authority response
    authorityResponse: { type: String, default: "" },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
    // District the issue belongs to
    district: { type: String, default: "" },
    // Deadline for authority (24hrs from creation if targeted to authority)
    deadline: { type: Date },
    // TTL: set when completed, triggers auto-delete after 1 minute
    deleteAt: { type: Date, default: null },
  },
  { timestamps: true },
);

PostSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
