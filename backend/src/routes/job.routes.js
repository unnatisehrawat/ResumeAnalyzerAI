import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createAndParseJD } from "../controllers/job.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createAndParseJD);

export default router;
