import {getCollections} from '../db/collections.js';
import { ObjectId } from "mongodb";

// get profile by user name
export const getSingleProfile = async (req, res)  => {
    try {
        const { profileCollection } = getCollections();
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
    
        const result = await profileCollection.findOne({
            _id: new ObjectId(userId)
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: result,
        });

    } catch (error) {
        console.error("GET /profile by user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};