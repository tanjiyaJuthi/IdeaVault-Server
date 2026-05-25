import mongoose from "mongoose";
import { profileSchema } from "../schemas/profileSchema.js";

export const Profile = mongoose.model("User", profileSchema, "user");