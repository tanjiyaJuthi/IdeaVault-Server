import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import { 
    getTopFiveCategory,
    getAllCategories,
} from '../controllers/categoryController.js';

const categoryRoutes = express.Router();

categoryRoutes.get(
    "/",
    getAllCategories
);

categoryRoutes.get(
    "/top-five",
    getTopFiveCategory
);

export default categoryRoutes;