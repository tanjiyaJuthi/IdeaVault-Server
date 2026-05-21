import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import {
    addComment, 
    getCommentByUser, 
    deleteComment 
} from '../controllers/commentController.js';

const commentRoutes =  express.Router();

commentRoutes.post(
    "/",
    verifyToken,
    addComment
);

commentRoutes.get(
    "/:userId",
    verifyToken,
    getCommentByUser
);

commentRoutes.delete(
    "/:commentId",
    verifyToken,
    deleteComment
);

export default commentRoutes;