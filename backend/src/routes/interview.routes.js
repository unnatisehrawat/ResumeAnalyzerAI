import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { generateInterview, getLatestInterview } from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateInterview);
router.get("/latest", authMiddleware, getLatestInterview);

export default router;
