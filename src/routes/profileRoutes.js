import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import { getMyProfile } from '../controllers/profileController.js';

export const profileRoutes =  express.Router();

profileRoutes.get(
    "/my-profile",
    verifyToken,
    getMyProfile
);

export default profileRoutes;