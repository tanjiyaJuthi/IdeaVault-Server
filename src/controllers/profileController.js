import { ObjectId } from "mongodb";
import { getCollections } from "../db/collections.js";

// ================= GET FULL PROFILE =================
export const getMyProfile = async (req, res) => {
  try {
    const {
      profileCollection,
      ideaCollection,
      commentCollection,
    } = getCollections();

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await profileCollection.findOne({
      _id: new ObjectId(userId),
    });

    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const ideas = await ideaCollection
      .find({
        createdBy: userId,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    const comments = await commentCollection
      .find({
        userId: userId,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",

      data: {
        user,
        ideas,
        comments,

        stats: {
          totalIdeas: ideas.length,
          totalComments: comments.length,
        },
      },
    });
  } catch (error) {
    console.error("GET /my-profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { profileCollection } = getCollections();

    const userId = req.user?.id;
    const { image } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const isValidUrl = /^https?:\/\/.+/i.test(image);

    if (!isValidUrl) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL",
      });
    }

    const updatedProfile = await profileCollection.findOneAndUpdate(
      {_id: new ObjectId(userId)},
      { $set: { image } },
      { new: true }
    );
    
    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("updateProfileImage error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};