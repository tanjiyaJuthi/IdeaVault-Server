import mongoose from "mongoose";
import { Favourite } from "../models/favouriteModel.js";

export const toggleFavorite = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const ideaId = new mongoose.Types.ObjectId(req.body.ideaId);

    const existingFavorite = await Favourite.findOne({
      userId,
      ideaId,
    });

    if (existingFavorite) {
      await Favourite.deleteOne({
        _id: existingFavorite._id,
      })

      return res.status(200).json({
        success: true,
        isFavorite: false,
      })
    }

    await Favourite.create({
      userId,
      ideaId,
    })

    return res.status(200).json({
      success: true,
      isFavorite: true,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getFavorites = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const favorites = await Favourite
      .aggregate([
        {
          $match: {
            userId,
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
          $unwind: "$idea",
        },

        {
          $replaceRoot: {
            newRoot: "$idea",
          },
        },
      ]);

    res.status(200).json({
      success: true,
      favorites,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}