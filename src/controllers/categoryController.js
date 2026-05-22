import {getCollections} from '../db/collections.js';

export const getTopFiveCategory = async (req, res) => {
    try {

        const { ideaCollection } = getCollections();

        const result = await ideaCollection.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalIdeas: { $sum: 1 },
                },
            },
            {
                $sort: {
                    totalIdeas: -1,
                },
            },
            {
                $limit: 5,
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    totalIdeas: 1,
                },
            },
        ]).toArray();

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

export const getAllCategories = async (req, res) => {
  try {
    const { categoryCollection } = getCollections();

    const categories = await categoryCollection
      .find({})
      .project({ _id: 0, name: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};