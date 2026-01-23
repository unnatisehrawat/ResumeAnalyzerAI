import express from "express";
import upload from "../utils/multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  uploadResume,
  parseResume
} from "../controllers/resume.controller.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);


router.post(
  "/parse/:id",
  authMiddleware,
  parseResume
);

export default router;
