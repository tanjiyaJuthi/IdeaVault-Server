import { Profile } from "../models/profileModel.js";
import { Idea } from "../models/ideaModel.js";
import { Comment } from "../models/commentModel.js";

// ================= GET FULL PROFILE =================
export const getMyProfile = async (req, res) => {
    try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await Profile.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const ideas = await Idea.find({
      createdBy: userId,
    }).sort({
      createdAt: -1,
    });

    const comments = await Comment
      .find({ userId: userId,})
      .populate("ideaId")
      .sort({ createdAt: -1 });

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

// ================= UPDATE PROFILE IMAGE =================
export const updateProfileImage = async (req, res) => {
  try {
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

    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      { $set: { image } },
      { returnDocument: "after" }
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