import { calculateFinalMatchScore } from "./matchScoring.service.js";
import { findRelevantResumeProjects } from "./projectRelevance.service.js";

/**
 * MASTER Resume Analysis Service
 * Combines:
 * - Rule-based ATS score
 * - LLM semantic skill match (Groq)
 * - Project relevance (Groq)
 */
export const analyzeResume = async (
  resumeData,
  jdData
) => {
  // 1️⃣ ATS + Semantic Skill Matching (Groq)
  const matchResult =
    await calculateFinalMatchScore(
      resumeData,
      jdData
    );

  // 2️⃣ Project relevance (Groq)
  const relevantProjects =
    await findRelevantResumeProjects(
      resumeData.projects || [],
      jdData
    );

  // 3️⃣ Experience Check
  const jdExpYears = extractMinYears(
    jdData.experienceLevel || ""
  );

  const resumeExpYears =
    resumeData.totalYearsExperience || 0;

  const isExperienceMatch =
    resumeExpYears >= jdExpYears;

  // 4️⃣ Final structured response
  return {
    overallScore: matchResult.finalScore,

    breakdown: {
      ruleBasedScore:
        matchResult.ruleBasedScore,
      semanticScore:
        matchResult.semanticScore,
      requiredSkillBonus:
        matchResult.requiredSkillBonus
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

    projectRelevance: relevantProjects.slice(
      0,
      3
    ), // top 3 projects

    verdict: getVerdict(
      matchResult.finalScore
    )
  };
};

/**
 * Extracts minimum years from experience string
 * e.g. "3+ years" → 3
 */
const extractMinYears = (expString) => {
  const match = expString.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
};

/**
 * Converts numeric score → human readable verdict
 */
const getVerdict = (score) => {
  if (score >= 80) return "Strong Fit";
  if (score >= 60) return "Good Fit";
  if (score >= 40) return "Partial Fit";
  return "Weak Fit";
};
