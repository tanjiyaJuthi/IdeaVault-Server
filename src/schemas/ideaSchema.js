import mongoose from "mongoose";

export const ideaSchema = new mongoose.Schema(
  {
    ideaTitle: String,
    shortDescription: String,
    category: String,
    tags: [String],
    imageUrl: String,
    estimatedBudget: String,
    problemStatement: String,
    proposedSolution: String,
    detailedDescription: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    commentCount:
    {
        type: Number,
        default: 0 
    },
    rating: {
        type: Number,
        default: 0
    },
  },
  { timestamps: true }
);