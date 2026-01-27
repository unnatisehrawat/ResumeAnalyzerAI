import { generateWithGroq } from "./groq.service.js";
import { parseLLMJson } from "../utils/jsonParser.js";

/**
 * LLM-based semantic skill matching using Groq
 * Returns a score between 0–100
 */
export const skillMatch = async (
  resumeSkills = [],
  jdSkills = []
) => {
  if (!resumeSkills.length || !jdSkills.length) return 0;

  const messages = [
    {
      role: "system",
      content: `
You are a neutral, professional Applicant Tracking System (ATS).

Your task is to evaluate how well a candidate’s skills match a job’s required skills.

You MUST:
- Be unbiased (no assumptions about gender, education, company names, seniority, or prestige)
- Judge ONLY based on skills provided
- Avoid over-scoring loosely related or buzzword-only matches
- Prefer exact matches first, then strong semantic equivalents
- Penalize missing REQUIRED skills appropriately
- Do NOT infer skills that are not explicitly or clearly implied

You are strict but fair.
`
    },
    {
      role: "user",
      content: `
Resume skills:
${resumeSkills.join(", ")}

Job required skills:
${jdSkills.join(", ")}

Evaluation rules:
- Treat exact matches as strongest
- Treat close semantic equivalents as valid (e.g. "Node.js" ↔ "Express.js")
- Treat transferable skills cautiously (only if clearly relevant)
- Ignore unrelated or weakly related skills
- Do NOT reward years of experience, certifications, or company names
- If a required skill is missing, list it clearly
- Score should reflect real ATS screening standards

Scoring guidance:
- 90–100 → Excellent match (almost all required skills present)
- 70–89 → Strong match (minor gaps)
- 40–69 → Partial match (noticeable gaps)
- 0–39 → Weak match (major gaps)
- Use the full 0–100 range and avoid returning only multiples of 10
- When choosing between two bands (e.g. 70 and 80), pick a specific number in between (e.g. 73 or 78) that best reflects the match

Return ONLY valid JSON in the following format:

{
  "score": number,          // integer between 0–100
  "matchedSkills": string[],
  "missingSkills": string[]
}
`
    }
  ];

  try {
    const completion = await generateWithGroq(messages);

    const content =
      completion.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("Groq returned empty response, returning 0");
      return 0;
    }

    const result = parseLLMJson(content);
    if (!result) {
      console.warn("Failed to parse skill match JSON, returning 0");
      return 0;
    }

    const rawScore = Number(result.score);
    const boundedScore = Number.isFinite(rawScore)
      ? Math.min(100, Math.max(0, Math.round(rawScore)))
      : 0;

    console.log("Skill Match LLM Score:", boundedScore);
    return boundedScore;
  } catch (error) {
    console.error(
      "Groq skill match failed, returning 0:",
      error.message
    );
    return 0;
  }
};

