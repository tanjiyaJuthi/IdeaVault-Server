import mongoose from "mongoose";
import { favoriteSchema } from "../schemas/favouriteSchema.js";

export const Favourite = mongoose.model("Favourite", favoriteSchema);