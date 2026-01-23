import { cosineSimilarity } from "./cosineSimilarity.js";
import { generateEmbeddings } from "./embedding.service.js";

/**
 * Embedding-based semantic skill matching
 * Returns a score between 0–100
 */
export const embeddingSkillMatch = async (
  resumeSkills = [],
  jdSkills = []
) => {
  // Guard: empty skills → no semantic match
  if (!resumeSkills.length || !jdSkills.length) return 0;

  // 1️⃣ Convert skills into normalized text (IMPORTANT IMPROVEMENT)
  const resumeText = resumeSkills.join(", ").toLowerCase();
  const jdText = jdSkills.join(", ").toLowerCase();

  try {
    // 2️⃣ Generate embeddings (Python / embedding microservice)
    const resumeEmbedding = await generateEmbeddings(resumeText);
    const jdEmbedding = await generateEmbeddings(jdText);

    // 3️⃣ Compute cosine similarity (0 → 1)
    const similarity = cosineSimilarity(
      resumeEmbedding,
      jdEmbedding
    );

    // 4️⃣ Convert similarity to percentage (0 → 100)
    return Math.round(similarity * 100);
  } catch (error) {
    // Fail-safe: never crash resume analysis
    console.error(
      "Embedding semantic skill match failed, returning 0:",
      error.message
    );
    return 0;
  }
};
