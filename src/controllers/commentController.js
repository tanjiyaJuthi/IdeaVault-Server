import {getCollections} from '../db/collections.js';
import { ObjectId } from 'mongodb';
import client from "../config/db.js";

// add a comment
export const addComment = async (req, res) => {
    const userId = req.user.id;
    // console.log('user: ', req.user);
    let session;
    
    try {
        session = client.startSession()

        const { commentCollection, ideaCollection } = getCollections();

        const {
            userName,
            userImage,
            ideaId,
            ideaTitle,
            shortDescription,
            detailedDescription,
            category,
            tags,
            imageUrl,
            estimatedBudget,
            targetAudience,
            problemStatement,
            proposedSolution
        } = req.body;

        let result;

        await session.withTransaction(async () => {
            const existingComment = await commentCollection.findOne(
                {
                    userId,
                    ideaId,
                },
                { session }
            );

            if (existingComment) {
                throw new Error("You already commented on this idea");
            }

            const comment = await ideaCollection.findOne(
                { _id: new ObjectId(ideaId) },
                { session }
            );

            if (!comment) {
                throw new Error("Comment not found");
            }

            const commentData = await commentCollection.insertOne({
                    userId,
                    userName,
                    userImage,
                    ideaTitle,
                    shortDescription,
                    detailedDescription,
                    category,
                    tags,
                    imageUrl,
                    estimatedBudget,
                    targetAudience,
                    problemStatement,
                    proposedSolution,
                    createdAt: new Date(),
                },
                { session }
            );

            await ideaCollection.updateOne(
                { _id: new ObjectId(ideaId) },
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
}

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