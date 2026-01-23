import prisma from "../utils/prisma.js";
import { generateInterviewQuestions } from "../services/interview.service.js";

export const generateInterview = async (req, res) => {
  try {
    let { resumeId, jobDescriptionId, analysisId } = req.body;

    // If analysisId is provided, look up resumeId and jobDescriptionId
    if (analysisId) {
      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId }
      });
      if (analysis) {
        resumeId = analysis.resumeId;
        jobDescriptionId = analysis.jobDescriptionId;
      }
    }

    if (!resumeId || !jobDescriptionId) {
      return res.status(400).json({
        message: "Resume ID and Job Description ID (or Analysis ID) are required"
      });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    const jd = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId }
    });

    if (!resume || !jd) {
      return res.status(404).json({
        message: "Resume or Job Description not found"
      });
    }

    if (!resume.parsedData || !jd.parsedData) {
      return res.status(400).json({
        message: "Resume or Job Description not parsed yet"
      });
    }

    const questions = await generateInterviewQuestions(
      resume.parsedData,
      jd.parsedData
    );

    const interview = await prisma.interview.create({
      data: {
        resumeId,
        jobDescriptionId,
        questions
      }
    });

    res.status(200).json({
      message: "Interview questions generated successfully",
      interview: {
        id: interview.id,
        questions
      }
    });
  } catch (error) {
    console.error("Interview generation error:", error);
    res.status(500).json({
      message: "Failed to generate interview questions: " + error.message
    });
  }
};

export const getLatestInterview = async (req, res) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        resume: {
          userId: req.user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!interview) {
      return res.status(404).json({
        message: "No interview prep found. Please run an analysis first."
      });
    }

    res.status(200).json(interview);
  } catch (error) {
    console.error("Fetch latest interview error:", error);
    res.status(500).json({ message: "Failed to fetch latest interview" });
  }
};
