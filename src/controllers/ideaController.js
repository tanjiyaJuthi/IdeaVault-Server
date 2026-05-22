import { ObjectId } from 'mongodb';

import {getCollections} from '../db/collections.js';

import { escapeRegex, generateSlug } from '../lib/helper.js';

// add idea
export const addIdea = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const idea = req.body;

        if (!idea || typeof idea !== "object") {
            return res.status(400).json({
                success: false,
                message: "Invalid request body",
            });
        }

        const requiredFields = [
            "ideaTitle",
            "shortDescription",
            "category",
            "tags",
            "imageUrl",
            "estimatedBudget",
            "problemStatement",
            "proposedSolution",
            "detailedDescription",
        ];

        const missingFields = requiredFields.filter(
            (field) => !idea[field] || idea[field].toString().trim() === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                missingFields,
            });
        }

        if (typeof idea.tags === "string") {
            idea.tags = idea.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        }

        if (!Array.isArray(idea.tags)) {
            return res.status(400).json({
                success: false,
                message: "Tags must be a string or array",
            });
        }

        idea.tags = idea.tags.filter(Boolean);

        idea.slug = generateSlug(idea.ideaTitle);

        const result = await ideaCollection.insertOne({
            ...idea,
            createdAt: new Date(),
        });

        const createdIdea = await ideaCollection.findOne({
            _id: result.insertedId,
        });

        return res.status(201).json({
            success: true,
            message: "Idea created successfully",
            data: createdIdea,
        });

    } catch (error) {
        console.error("POST /idea error:", error);

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

// get idea by id
export const getIdeaByid = async (req, res) => {
  try {
    const { ideaCollection } = getCollections();

    const { id } = req.params;

    const result = await ideaCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Idea fetched successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
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

// search idea
export const searchIdeas = async (req, res) => {
  try {
    const { ideaCollection } = getCollections();

    const {
      search = "",
      category = "",
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          query.createdAt.$gte = start;
        }
      }

      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }

    if (search.trim()) {
      query.ideaTitle = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const result = await ideaCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ideas by user id
export const getIdeasByUser = async (req, res) => {
    try {
        const { ideaCollection } = getCollections();
        const userId = req.params.userId;

        if (req.user.sub !== userId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            });
        }

        const result = await ideaCollection
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: result,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
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