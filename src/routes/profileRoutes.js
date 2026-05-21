import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import { getSingleProfile } from '../controllers/profileController.js';

export const profileRoutes =  express.Router();

profileRoutes.get(
    "/my-profile",
    verifyToken,
    getSingleProfile
);

export default profileRoutes;