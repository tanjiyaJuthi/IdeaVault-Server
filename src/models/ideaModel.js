import mongoose from "mongoose";
import { ideaSchema } from "../schemas/ideaSchema.js";

export const Idea = mongoose.model("Idea", ideaSchema);