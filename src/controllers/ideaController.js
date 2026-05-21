import { ObjectId } from 'mongodb';

import {getCollections} from '../db/collections.js';

import { escapeRegex, generateSlug } from '../lib/helper.js';

// add idea
export const addIdea = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const idea = req.body;

        if (!idea || Object.keys(idea).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Idea data is required",
            });
        }

        idea.slug = generateSlug(idea.ideaTitle);

        const result = await ideaCollection.insertOne(idea);
        
        return res.status(201).json({
            success: true,
            message: "Idea created successfully",
            data: result,
        });

    } catch (error) {
        // console.error("POST /idea error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// get all idea
export const getAllIdea = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const result = await ideaCollection.find().toArray();
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Ideas fetched successfully",
            data: result,
        });

    } catch (error) {
        // console.error("GET /idea error:", error);

        return res.status(500).json({
            success: false,
            message: "Idea server error",
        });
    }
};

// get idea by slug
export const getIdeaBySlug = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const {slug} = req.params;

        const normalizedSlug = slug.toLowerCase().trim();

        const safeSlug = escapeRegex(normalizedSlug);

        const result = await ideaCollection.findOne({
            slug: { $regex: `^${safeSlug}$`, $options: "i" }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Idea not found",
            });
        }
        
        // console.log(result);
        return res.status(200).json({
            success: true,
            message: "Idea fetched successfully",
            data: result,
        });

    } catch (error) {
        // console.error("GET /idea error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// featured idea
export const featuredIdeaByCategory = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();

        const { category } = req.query;

        let query = {};

        if (category) {
        query.category = category;
        }

        const result = await ideaCollection
        .find(query)
        .sort({ rating: -1 })
        .limit(10)
        .toArray();

        return res.status(200).json({
        success: true,
        data: result,
        });

    } catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message,
        });
    }
};

// update idea
export const updateIdea = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const { id } = req.params;

        const updatedIdea = req.body;

        const allowedFields = [
            "ideaTitle",
            "shortDescription",
            "detailedDescription",
            "category",
            "tags",
            "imageUrl",
            "estimatedBudget",
            "targetAudience",
            "problemStatement",
            "proposedSolution"
        ];

        const safeUpdate = {};

        for (const key of allowedFields) {
            if (updatedIdea[key] !== undefined) {
                safeUpdate[key] = updatedIdea[key];
            }
        }

        if (!updatedIdea || Object.keys(updatedIdea).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Idea data is required",
            });
        }

        const existing = await ideaCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Idea not found",
            });
        }

        if (updatedIdea.ideaTitle) {
            updatedIdea.slug = generateSlug(updatedIdea.ideaTitle);
        }

        await ideaCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: safeUpdate }
        );

        const updatedDoc = await ideaCollection.findOne({
            _id: new ObjectId(id),
        });

        return res.status(200).json({
            success: true,
            message: "Idea updated successfully",
            data: updatedDoc,
        });

    } catch (error) {
        // console.error("PATCH /idea error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// delete idea
export const deleteIdea = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await ideaCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({
            message: "Idea Deleted successfully",
            result
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};