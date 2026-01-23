import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Expected format: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verify user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Attach user info to request
    req.user = user;

    // 5. Continue to controller
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
