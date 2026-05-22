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

    // ================= AUTH CHECK =================
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ================= GET USER =================
    const user = await profileCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // ================= GET USER IDEAS =================
    const ideas = await ideasCollection
      .find({
        userId: userId,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    // ================= GET USER COMMENTS =================
    const comments = await commentsCollection
      .find({
        userId: userId,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    // ================= RESPONSE =================
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