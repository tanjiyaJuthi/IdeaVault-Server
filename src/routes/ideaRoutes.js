import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";

import {
  addIdea,
  deleteIdea,
  featuredIdeaByCategory,
  getAllIdea,
  getIdeaByid,
  updateIdea,
  searchIdeas,
  getIdeasByUser,
} from "../controllers/ideaController.js";

const IdeaRoutes = express.Router();

IdeaRoutes.get("/", getAllIdea);

IdeaRoutes.get("/search", searchIdeas);

IdeaRoutes.get("/featured-idea", featuredIdeaByCategory);

IdeaRoutes.get(
  "/my-ideas",
  verifyToken,
  getIdeasByUser
);

IdeaRoutes.get(
  "/:id",
  verifyToken,
  getIdeaByid
);

IdeaRoutes.post(
  "/",
  verifyToken,
  addIdea
);

IdeaRoutes.patch(
  "/:id",
  verifyToken,
  updateIdea
);

IdeaRoutes.delete(
  "/:id",
  verifyToken,
  deleteIdea
);

export default IdeaRoutes;