import { calculateFinalMatchScore } from "./matchScoring.service.js";
import { findRelevantResumeProjects } from "./projectRelevance.service.js";

/**
 * MASTER Resume Analysis Service
 * Combines:
 * - ATS score
 * - Semantic skill match
 * - Project relevance (resume → JD)
 */
export const analyzeResume = async (resumeData, jdData) => {
  // 1️⃣ ATS + Semantic Skill Matching
  const matchResult = await calculateFinalMatchScore(
    resumeData,
    jdData
  );

  // 2️⃣ Project relevance (EACH resume project vs JD)
  const relevantProjects = await findRelevantResumeProjects(
    resumeData.projects || [],
    jdData
  );

  // 3️⃣ Experience Check
  const jdExpYears = extractMinYears(jdData.experienceLevel || "");
  const resumeExpYears = resumeData.totalYearsExperience || 0;
  const isExperienceMatch = resumeExpYears >= jdExpYears;

  // 4️⃣ Final structured analysis
  return {
    overallScore: matchResult.finalScore,
    breakdown: {
      ruleBasedScore: matchResult.ruleBasedScore,
      semanticScore: matchResult.semanticScore
    },
    skills: {
      matched: matchResult.matchedSkills,
      missing: matchResult.missingSkills
    },
    experience: {
      required: jdData.experienceLevel,
      found: `${resumeExpYears} years`,
      isMatch: isExperienceMatch
    },
    projectRelevance: relevantProjects.slice(0, 3), // top 3 projects
    verdict: getVerdict(matchResult.finalScore)
  };
};

/**
 * Extracts minimum years from experience string (e.g. "3+ years" -> 3)
 */
const extractMinYears = (expString) => {
  const match = expString.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
};

/**
 * Converts numeric score → human readable result
 */
const getVerdict = (score) => {
  if (score >= 80) return "Strong Fit";
  if (score >= 60) return "Good Fit";
  if (score >= 40) return "Partial Fit";
  return "Weak Fit";
};
