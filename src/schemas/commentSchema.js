import mongoose from "mongoose";

export const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: String,
    userImage: String,
    ideaId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Idea",
        required: true
    },
    commentText: String,
  },
  { timestamps: true }
);