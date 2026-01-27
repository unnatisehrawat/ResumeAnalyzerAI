import { skillMatch } from "./skillMatching.service.js";

export const calculateFinalMatchScore = async (
  resumeData,
  jdData
) => {
  try {
    const resumeSkills = resumeData.skills || [];
    const requiredSkills = jdData.requiredSkills || [];
    const preferredSkills = jdData.preferredSkills || [];

    const allJdSkills = [
      ...requiredSkills,
      ...preferredSkills
    ];

    // -----------------------------
    // 1️⃣ Rule‑based ATS matching
    // -----------------------------
    const matchedSkills = resumeSkills.filter(skill =>
      allJdSkills.some(jdSkill =>
        skill.toLowerCase().includes(jdSkill.toLowerCase()) ||
        jdSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const missingSkills = requiredSkills.filter(reqSkill =>
      !resumeSkills.some(skill =>
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const ruleBasedScore = allJdSkills.length
      ? Math.round(
        (matchedSkills.length / allJdSkills.length) * 100
      )
      : 0;

    // -----------------------------
    // 2️⃣ LLM‑based semantic score (Groq)
    // -----------------------------
    const semanticScore = await skillMatch(
      resumeSkills,
      allJdSkills
    );

    // -----------------------------
    // 3️⃣ REQUIRED skill bonus
    // -----------------------------
    const matchedRequiredSkills = requiredSkills.filter(reqSkill =>
      resumeSkills.some(skill =>
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const requiredSkillBonus = requiredSkills.length
      ? Math.round(
        (matchedRequiredSkills.length /
          requiredSkills.length) *
        100
      )
      : 0;

    // -----------------------------
    // 4️⃣ FINAL WEIGHTED SCORE
    // -----------------------------
    const finalScore = Math.round(
      ruleBasedScore * 0.5 +
      semanticScore * 0.4 +
      requiredSkillBonus * 0.1
    );

    return {
      finalScore,
      ruleBasedScore,
      semanticScore,
      requiredSkillBonus,
      matchedSkills,
      missingSkills
    };
  } catch (error) {
    console.error(
      "Final match score error:",
      error.message
    );

    return {
      finalScore: 0,
      ruleBasedScore: 0,
      semanticScore: 0,
      requiredSkillBonus: 0,
      matchedSkills: [],
      missingSkills: jdData?.requiredSkills || []
    };
  }
};
