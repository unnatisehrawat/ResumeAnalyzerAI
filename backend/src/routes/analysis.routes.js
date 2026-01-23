import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { runAnalysis, getAnalysisHistory, getAnalysisDetail } from "../controllers/analysis.controller.js";

const router = express.Router();

router.post("/run", authMiddleware, runAnalysis);
router.get("/history", authMiddleware, getAnalysisHistory);
router.get("/:id", authMiddleware, getAnalysisDetail);

export default router;
