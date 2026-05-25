import mongoose from "mongoose";

export const categorySchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true, 
            unique: true 
        },
    },
    { timestamps: true }
);