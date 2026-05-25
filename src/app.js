import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import 'dotenv/config';
import express from "express";
import cors from "cors";

import { connectMongoose } from "./config/db.js";

import ideaRoutes from "./routes/ideaRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.BETTER_AUTH_URL,
  credentials: true,
}));
app.use(express.json());

await connectMongoose();

// to check if endpoint is working or not
// app.use((req, res, next) => {
//   console.log(req.method, req.url);
//   next();
// });

// routes
app.use("/idea", ideaRoutes);
app.use("/interaction", commentRoutes);
app.use("/profile", profileRoutes);
app.use("/category", categoryRoutes);
app.use("/favourite", favouriteRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

export default app;