import express from "express";

import {verifyToken} from "../middleware/verifyToken.js";

import {
    addComment, 
    getCommentByUser, 
    deleteComment,
    getCommentsByIdea,
    updateComment,
    getMyComment,
} from '../controllers/commentController.js';

const commentRoutes =  express.Router();

commentRoutes.get(
  "/my-interactions",
  verifyToken,
  getMyComment
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

commentRoutes.post(
    "/",
    verifyToken,
    addComment
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