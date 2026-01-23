import { generateEmbeddings } from "./embedding.service.js";
import { cosineSimilarity } from "./cosineSimilarity.js";

/**
 * Compare each resume project with JD
 * Returns relevance score per project
 */
export const findRelevantResumeProjects = async (
  resumeProjects = [],
  jdData
) => {
  if (!resumeProjects.length) return [];

  // 1️⃣ Prepare JD text → embedding
  const jdText = `
    ${jdData.title || ""}
    ${jdData.description || ""}
    ${(jdData.requiredSkills || []).join(", ")}
  `.toLowerCase().trim();

  const jdEmbedding = await generateEmbeddings(jdText);

  // 2️⃣ Compare each resume project with JD
  const scoredProjects = [];

  for (const project of resumeProjects) {
    const projectText = `
      ${project.name || project.title || ""}
      ${project.description || ""}
      ${(project.technologies || []).join(", ")}
    `.toLowerCase().trim();

    const projectEmbedding = await generateEmbeddings(projectText);

    const similarity = cosineSimilarity(
      projectEmbedding,
      jdEmbedding
    );

    scoredProjects.push({
      name: project.name || project.title,
      relevanceScore: Math.round(similarity * 100),
      description: project.description
    });
  }

  // 3️⃣ Sort best → worst
  return scoredProjects.sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );
};
