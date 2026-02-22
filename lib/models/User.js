import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["citizen", "authority"], default: "citizen" },
    department: { type: String, default: "" }, // only for authority
    // Gamification
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    issuesRaised: { type: Number, default: 0 },
    issuesSolved: { type: Number, default: 0 },
    volunteerCount: { type: Number, default: 0 },
    // Authority specific
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalResolved: { type: Number, default: 0 },
    totalIgnored: { type: Number, default: 0 },
    // Authority area targeting: which districts & categories they cover
    area: {
      districts: [{ type: String }],
      categories: [{ type: String }],
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
