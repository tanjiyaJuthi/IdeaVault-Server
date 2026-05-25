import mongoose from "mongoose";
import { commentSchema } from "../schemas/commentSchema.js";

export const Comment = mongoose.model("Comment", commentSchema);