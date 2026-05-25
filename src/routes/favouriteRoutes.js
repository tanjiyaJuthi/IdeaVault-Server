import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import { 
    toggleFavorite,
    getFavorites,
} from '../controllers/favoriteController.js';

const favouriteRoutes = express.Router();

favouriteRoutes.post(
    "/toggle",
    verifyToken,
    toggleFavorite
);

favouriteRoutes.get(
    "/",
    verifyToken,
    getFavorites
);

export default favouriteRoutes;