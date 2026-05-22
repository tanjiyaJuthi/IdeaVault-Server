import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import {
    addComment, 
    getCommentByUser, 
    deleteComment,
    getCommentsByIdea,
    updateComment,
} from '../controllers/commentController.js';

const commentRoutes =  express.Router();

commentRoutes.post(
    "/",
    verifyToken,
    addComment
);

commentRoutes.get(
    "/idea/:ideaId",
    verifyToken,
    getCommentsByIdea
);

commentRoutes.get(
    "/:userId",
    verifyToken,
    getCommentByUser
);

commentRoutes.put(
  "/:commentId",
  verifyToken,
  updateComment
);

commentRoutes.delete(
    "/:commentId",
    verifyToken,
    deleteComment
);

export default commentRoutes;