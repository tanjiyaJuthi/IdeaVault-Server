import mongoose from "mongoose";
import { Comment } from '../models/commentModel.js';
import { Idea } from '../models/ideaModel.js';

// add a comment
export const addComment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const { ideaId, commentText } = req.body;

    if (!ideaId || !commentText) {
      return res.status(400).json({
        success: false,
        message: "ideaId and commentText are required",
      });
    }

    let result;

    await session.withTransaction(async () => {
      // 1. duplicate check
      const existingComment = await Comment.findOne(
        { userId, ideaId },
        null,
        { session }
      );

      if (existingComment) {
        throw new Error("You already commented on this idea");
      }

      // 2. verify idea
      const idea = await Idea.findById(ideaId, null, { session });

      if (!idea) throw new Error("Idea not found");

      // 3. create comment
      const [created] = await Comment.create(
        [
          {
            userId,
            ideaId,
            commentText,
          },
        ],
        { session }
      );

      // 4. increment counter
      await Idea.updateOne(
        { _id: ideaId },
        { $inc: { commentCount: 1 } },
        { session }
      );

      result = created;
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
    session.endSession();
  }
};

// get comment by userId
export const getCommentByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ success: false });
    }

    const comments = await Comment.find({ userId })
      .populate("ideaId", "ideaTitle imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = comments.map(c => ({
      _id: c._id,
      commentText: c.commentText,
      createdAt: c.createdAt,
      idea: c.ideaId
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// comments by idea
export const getCommentsByIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;

    const comments = await Comment.find({ ideaId })
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = comments.map(c => ({
      _id: c._id,
      commentText: c.commentText,
      createdAt: c.createdAt,
      user: c.userId
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// get comment by user with idea
export const getMyComment = async (req, res) => {
  try {
    const userId = req.user.id;

    const comments = await Comment.find({ userId })
      .populate(
        "ideaId",
        "ideaTitle imageUrl shortDescription category"
      )
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    const formattedComment = comments.map(comment => ({
      _id: comment._id,
      commentText: comment.commentText,
      createdAt: comment.createdAt,

      user: comment.userId,
      idea: comment.ideaId
    }));

    return res.status(200).json({
      success: true,
      data: formattedComment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// remove comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deleted = await Comment.findByIdAndDelete(commentId);

    if (!deleted) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    return res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// update comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { commentText } = req.body;

    const userId = req.user.id;

    if (!commentText) {
      return res.status(400).json({
        success: false,
        message: "commentText is required",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    comment.commentText = commentText;
    comment.updatedAt = new Date();

    await comment.save();

    return res.json({
      success: true,
      message: "Comment updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};