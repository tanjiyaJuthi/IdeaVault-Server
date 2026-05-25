import mongoose from "mongoose";

export const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true
    },
  },
  { timestamps: true }
);

favoriteSchema.index({
    userId: 1,
    ideaId: 1
}, { unique: true });