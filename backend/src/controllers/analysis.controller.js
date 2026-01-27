import prisma from "../utils/prisma.js";
import { analyzeResume } from "../services/resumeAnalysis.service.js";
import { generateJDSuggestions } from "../services/jdSuggestion.service.js";

export const runAnalysis = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

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

    // Validate parsed data structure
    if (typeof resume.parsedData !== 'object' || typeof jd.parsedData !== 'object') {
      return res.status(400).json({
        message: "Invalid parsed data format. Please re-parse the resume and job description."
      });
    }

    console.log("Running analysis with resume ID:", resumeId, "and JD ID:", jobDescriptionId);

    // Use the comprehensive analysis service (includes embeddings & ATS logic)
    const matchResult = await analyzeResume(
      resume.parsedData,
      jd.parsedData
    );

    console.log("Analysis Result:", {
      score: matchResult.overallScore,
      verdict: matchResult.verdict,
      projects: matchResult.projectRelevance.length
    });

    console.log("Generating JD suggestions...");
    const jdSuggestions = await generateJDSuggestions(
      resume.parsedData,
      jd.parsedData,
      {
        finalScore: matchResult.overallScore,
        matchedSkills: matchResult.skills.matched,
        missingSkills: matchResult.skills.missing,
        ruleBasedScore: matchResult.breakdown.ruleBasedScore,
        semanticScore: matchResult.breakdown.semanticScore
      }
    );
    console.log("JD suggestions generated successfully");

    const analysis = await prisma.analysis.create({
      data: {
        resumeId,
        jobDescriptionId,
        matchScore: matchResult.overallScore,
        matchedSkills: matchResult.skills.matched,
        missingSkills: matchResult.skills.missing,
        projectRelevance: matchResult.projectRelevance,
        suggestions: jdSuggestions
      }
    });

    res.status(200).json({
      message: "Analysis completed successfully",
      analysis: {
        id: analysis.id,
        matchScore: matchResult.overallScore,
        ruleBasedScore: matchResult.breakdown.ruleBasedScore,
        semanticScore: matchResult.breakdown.semanticScore,
        matchedSkills: matchResult.skills.matched,
        missingSkills: matchResult.skills.missing,
        projectRelevance: matchResult.projectRelevance,
        verdict: matchResult.verdict,
        experience: matchResult.experience,
        jdSuggestions: jdSuggestions
      }
    });
  } catch (error) {
    console.error("Analysis error DETAIL:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to run analysis: " + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const history = await prisma.analysis.findMany({
      where: {
        resume: {
          userId: req.user.id
        }
      },
      include: {
        resume: true,
        jobDescription: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

export const getAnalysisDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        resume: true,
        jobDescription: true
      }
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error("Fetch analysis detail error:", error);
    res.status(500).json({ message: "Failed to fetch analysis details" });
  }
};
