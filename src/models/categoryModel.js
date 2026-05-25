import mongoose from "mongoose";
import { categorySchema } from "../schemas/categorySchema.js";

export const Category = mongoose.model("Category", categorySchema);