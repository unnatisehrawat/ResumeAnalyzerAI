import prisma from "../utils/prisma.js";
import { parseJDWithAI } from "../services/jdParser.service.js";


export const createAndParseJD = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Job description is required" });
    }

    // 1. Save raw JD
    const jd = await prisma.jobDescription.create({
      data: {
        userId: req.user.id,
        content
      }
    });

    // 2. Parse JD using Gemini
    const parsedData = await parseJDWithAI(content);

    // 3. Save parsed data
    await prisma.jobDescription.update({
      where: { id: jd.id },
      data: { parsedData }
    });

    res.status(201).json({
      message: "Job description parsed successfully",
      jobDescriptionId: jd.id,
      parsedData
    });
  } catch (error) {
    console.error("JD parsing error DETAIL:", error);
    res.status(500).json({ message: "JD parsing failed: " + error.message });
  }
};
