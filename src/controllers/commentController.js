import {getCollections} from '../db/collections.js';
import { ObjectId } from 'mongodb';
import client from "../config/db.js";

// add a comment
export const addComment = async (req, res) => {
  const userId = req.user.id;
  let session;

  try {
    session = client.startSession();

    const { commentCollection, ideaCollection } = getCollections();

    const { ideaId, commentText } = req.body;

    if (!ideaId || !commentText) {
      return res.status(400).json({
        success: false,
        message: "ideaId and commentText are required",
      });
    }

    let result;

    await session.withTransaction(async () => {
      // 1. check duplicate comment (optional rule)
      const existingComment = await commentCollection.findOne(
        {
          userId,
          ideaId: new ObjectId(ideaId),
        },
        { session }
      );

      if (existingComment) {
        throw new Error("You already commented on this idea");
      }

      // 2. verify idea exists
      const idea = await ideaCollection.findOne(
        { _id: new ObjectId(ideaId) },
        { session }
      );

      if (!idea) {
        throw new Error("Idea not found");
      }

      // 3. create comment (SAFE USER DATA FROM TOKEN)
      const commentData = await commentCollection.insertOne(
        {
          userId,
          userName: req.user.name || "Anonymous",
          userImage: req.user.image || "/avatar.png",
          ideaId: new ObjectId(ideaId),
          commentText,
          createdAt: new Date(),
        },
        { session }
      );

      // 4. update idea stats
      await ideaCollection.updateOne(
        { _id: new ObjectId(ideaId) },
        { $inc: { commentCount: 1 } },
        { session }
      );

      result = commentData;
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Create Comment failed",
    });
  } finally {
    if (session) await session.endSession();
  }
};

// get comment by userId
export const getCommentByUser = async (req, res) => {
    try {
        const { commentCollection } = getCollections();
        const {userId} = req.params;

        if (req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            });
        }
        
        const comments = await commentCollection
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
            
        res.json({
            success: true,
            data: comments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch comments",
        });
    }
};

// remove comment
export const deleteComment = async (req, res) => {
    try {
        const { commentCollection } = getCollections();
        const { commentId } = req.params;

        if (!ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await commentCollection.deleteOne({
            _id: new ObjectId(commentId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({
            message: "Comment Deleted successfully",
            result
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// comments by idea
export const getCommentsByIdea = async (req, res) => {
  try {
    const { commentCollection } = getCollections();
    const { ideaId } = req.params;

    const comments = await commentCollection
      .find({ ideaId: new ObjectId(ideaId) }) 
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// update comment
export const updateComment = async (req, res) => {
  try {
    const { commentCollection } = getCollections();
    const { commentId } = req.params;
    const { commentText } = req.body;

    const userId = req.user.id;

    if (!commentText) {
      return res.status(400).json({
        success: false,
        message: "commentText is required",
      });
    }

    const comment = await commentCollection.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await commentCollection.updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          commentText,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "Comment updated",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get comment by user
export const getMyComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentCollection } = getCollections();

    const comments = await commentCollection
      .aggregate([
        {
          $match: {
            userId: userId,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },

        {
          $lookup: {
            from: "ideas",
            localField: "ideaId",
            foreignField: "_id",
            as: "idea",
          },
        },

        {
          $unwind: {
            path: "$idea",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 1,
            commentText: 1,
            createdAt: 1,
            ideaId: 1,
            ideaTitle: "$idea.ideaTitle",
            shortDescription: "$idea.shortDescription",
            category: "$idea.category",
            imageUrl: "$idea.imageUrl",
          },
        },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};