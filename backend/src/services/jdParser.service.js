import { generateWithGroq } from "./groq.service.js";

// Small, safe JSON repair for common LLM mistakes (mainly trailing commas)
function repairJsonString(s) {
  if (!s || typeof s !== "string") return s;
  // remove trailing commas before ] or }
  return s.replace(/,(\s*[}\]])/g, "$1").trim();
}

// parsing JD using Groq
export const parseJDWithAI = async (jdText) => {
  try {
    // 1️⃣ Validate input
    if (!jdText || jdText.trim().length === 0) {
      throw new Error("Job description text is empty or invalid");
    }

    const prompt = `
You are an ATS job description parser.

CRITICAL RULES:
- Return ONLY valid JSON
- No explanations
- No markdown
- No text before or after JSON

Return this exact JSON structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceLevel": "string",
  "responsibilities": ["responsibility1", "responsibility2"],
  "keywords": ["keyword1", "keyword2"]
}

Job Description:
"""
${jdText}
"""

Return ONLY the JSON object starting with { and ending with }.
`;

    // 2️⃣ Call Groq (chat-based)
    const response = await generateWithGroq([
      {
        role: "system",
        content: "You are a strict JSON-only API for ATS parsing."
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    // 3️⃣ Extract text from Groq response
    const responseText = response.choices[0].message.content;

    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Groq returned an empty response for JD");
    }

    // 4️⃣ Clean possible markdown or extra text
    let cleanJSON = responseText.replace(/```json|```/g, "").trim();

    // 5️⃣ Extract JSON safely (production safety)
    const jsonMatch = cleanJSON.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJSON = jsonMatch[0];
    }

    // 6️⃣ Repair + Parse JSON
    cleanJSON = repairJsonString(cleanJSON);
    let parsed;
    try {
      parsed = JSON.parse(cleanJSON);
    } catch (e) {
      // Log and fall back to empty structure (so pipeline can continue)
      console.error("JD JSON Parse Error:", e.message);
      console.error("JD Raw Response (first 500 chars):", responseText.substring(0, 500));
      console.error("JD Attempted JSON (first 500 chars):", cleanJSON.substring(0, 500));
      parsed = {};
    }

    // 7️⃣ Return normalized structure (never undefined)
    return {
      requiredSkills: parsed.requiredSkills || [],
      preferredSkills: parsed.preferredSkills || [],
      experienceLevel: parsed.experienceLevel || "",
      responsibilities: parsed.responsibilities || [],
      keywords: parsed.keywords || []
    };
  } catch (error) {
    console.error("Groq AI Error (JD):", error);
    throw error;
  }
};
