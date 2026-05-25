import { Idea } from "../models/ideaModel.js";

// add idea
export const addIdea = async (req, res) => {
  try {
    const idea = req.body;
    const userId = req.user.id;

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

    const newIdea = await Idea.create({
      ...idea,
      createdBy: userId
    });

    return res.status(201).json({
      success: true,
      message: "Idea created successfully",
      data: newIdea,
    });
  } catch (error) {
    console.error("POST /idea error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get all ideas
export const getAllIdea = async (req, res) => {
  try {
    const result = await Idea.find();

    return res.status(200).json({
      success: true,
      message: "Ideas fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Idea server error",
    });
  }
};

// get idea by id
export const getIdeaByid = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Idea.findById(id);

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

// featured ideas by category
export const featuredIdeaByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    const query = category ? { category } : {};

    const result = await Idea.find(query)
      .sort({ rating: -1 })
      .limit(10);

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

// search ideas
export const searchIdeas = async (req, res) => {
  try {
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

    const result = await Idea.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

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

// ideas by user
export const getIdeasByUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not found in token",
      });
    }

    const result = await Idea.find({ createdBy: userId });

    return res.status(200).json({
      success: true,
      message: "Ideas fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// update idea
export const updateIdea = async (req, res) => {
  try {
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
      "proposedSolution",
    ];

    if (!updatedIdea || Object.keys(updatedIdea).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Idea data is required",
      });
    }

    const existing = await Idea.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      });
    }

    const userId = req.user.sub || req.user.id;

    if (existing.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const safeUpdate = {};

    for (const key of allowedFields) {
      if (updatedIdea[key] !== undefined) {
        safeUpdate[key] = updatedIdea[key];
      }
    }

    await Idea.updateOne(
      { _id: id },
      { $set: safeUpdate }
    );

    const updatedDoc = await Idea.findById(id);

    return res.status(200).json({
      success: true,
      message: "Idea updated successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete idea
export const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Idea.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    return res.json({
      message: "Idea deleted successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};