import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import resumeRoutes from "./src/routes/resume.routes.js";
import jobRoutes from "./src/routes/job.routes.js";
import analysisRoutes from "./src/routes/analysis.routes.js";
import interviewRoutes from "./src/routes/interview.routes.js";
const app = express();

app.use(cors({
  origin: [ "http://localhost:5173", "https://resume-analyzer-ai-seven.vercel.app" ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/job", jobRoutes);
app.use("/analysis", analysisRoutes);
app.use("/interview", interviewRoutes);


app.get("/", (req, res) => {
  res.json({ status: "API running" });
});



export default app;
