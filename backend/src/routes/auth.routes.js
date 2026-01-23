import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { register, login, changePassword, deleteAccount } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);
router.delete("/account", authMiddleware, deleteAccount);

export default router;
