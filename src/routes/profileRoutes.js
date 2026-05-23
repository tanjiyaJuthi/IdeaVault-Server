import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import { 
    getMyProfile, 
    updateProfileImage 
} from '../controllers/profileController.js';

export const profileRoutes =  express.Router();

profileRoutes.get(
    "/my-profile",
    verifyToken,
    getMyProfile
);

profileRoutes.patch(
    "/update-image",
    verifyToken,
    updateProfileImage
);

export default profileRoutes;