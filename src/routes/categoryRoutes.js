import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import { 
    getTopFiveCategory 
} from '../controllers/categoryController.js';

const categoryRoutes = express.Router();

categoryRoutes.get(
    "/top-five",
    getTopFiveCategory
);

export default categoryRoutes;