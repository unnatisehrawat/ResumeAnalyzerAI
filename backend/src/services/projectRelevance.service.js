import { generateWithGroq } from "./groq.service.js";
import { parseLLMJson } from "../utils/jsonParser.js";

/**
 * Compare each resume project with JD using Groq LLM
 * Returns relevance score per project
 */
export const findRelevantResumeProjects = async (
  resumeProjects = [],
  jdData
) => {
  if (!resumeProjects.length) return [];

  const jdText = `
Job Title:
${jdData.title || ""}

Job Description:
${jdData.description || ""}

Required Skills:
${(jdData.requiredSkills || []).join(", ")}
`.trim();

  const messages = [
    {
      role: "system",
      content: `
You are a neutral, professional Applicant Tracking System (ATS).

Your task is to evaluate how relevant each resume project is to a given job description.

You MUST:
- Be unbiased (no assumptions about candidate background, education, company names, seniority, geography, or prestige)
- Judge projects ONLY based on provided descriptions and technologies
- Avoid rewarding generic, academic, or toy projects unless clearly relevant
- Prefer projects that align with the job’s domain, required skills, and problem type
- Do NOT infer domain, scale, or "impressiveness" beyond what is explicitly stated
- Treat all companies and schools equally; focus only on skills and responsibilities
- Be strict but fair, as in a real recruiter screening
`
    },
    {
      role: "user",
      content: `
Job Description:
${jdText}

Resume Projects:
${resumeProjects
  .map(
    (p, i) => `
Project ${i + 1}:
Name: ${p.name || p.title}
Description: ${p.description || ""}
Technologies: ${(p.technologies || []).join(", ")}
`
  )
  .join("\n")}

Evaluation rules:
- Judge EACH project independently
- Exact domain + skill alignment → highest relevance
- Partial alignment → moderate relevance
- Generic, unrelated, or shallow projects → low relevance
- Do NOT infer features or skills not explicitly stated
- Do NOT reward project size, buzzwords, or naming
- Internship, college, or personal projects are treated equally

Scoring guidance:
- 80–100 → Strongly relevant to the job
- 50–79 → Moderately relevant
- 20–49 → Weakly relevant
- 0–19 → Not relevant
- Use the full 0–100 range and avoid returning only multiples of 10
- When projects are slightly better or worse than each other, reflect this with small score differences (e.g. 72 vs 76), not just big jumps

Return ONLY valid JSON in this exact format:

{
  "projects": [
    {
      "name": string,
      "relevanceScore": number
    }
  ]
}
`
    }
  ];

  try {
    const completion = await generateWithGroq(messages);

    const content =
      completion.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("Groq returned empty response");
      return [];
    }

    const result = parseLLMJson(content);

    if (!result || !result.projects) {
      console.warn("Failed to parse project relevance JSON, returning empty list");
      return [];
    }

    console.log(`Successfully parsed ${result.projects.length} relevant projects`);

    // Merge scores back with original project data
    return resumeProjects
      .map((project) => {
        const match = result.projects?.find(
          (p) =>
            p.name?.toLowerCase() ===
            (project.name || project.title)?.toLowerCase()
        );

        const rawScore = Number(match?.relevanceScore);
        const relevanceScore = Number.isFinite(rawScore)
          ? Math.min(100, Math.max(0, Math.round(rawScore)))
          : 0;

        return {
          name: project.name || project.title,
          description: project.description,
          relevanceScore,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error(
      "Groq project relevance failed:",
      error.message
    );
    return [];
  }
};

