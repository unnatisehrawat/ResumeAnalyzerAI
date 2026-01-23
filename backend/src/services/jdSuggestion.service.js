import { generateWithGroq } from "./groq.service.js";

export const generateJDSuggestions = async (
  resumeData,
  jdData,
  analysisResult
) => {
  try {
    const prompt = `
You are an ATS optimization assistant.

Given:
- Resume data
- Job description data
- Match analysis

Provide actionable suggestions WITHOUT adding fake skills or experience.

Rules:
- Do NOT invent experience
- Do NOT add new skills
- Suggest what to emphasize, rephrase, or reorder
- Be recruiter-focused

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${JSON.stringify(jdData, null, 2)}

Analysis:
Matched Skills: ${(analysisResult.matchedSkills || []).join(", ")}
Missing Skills: ${(analysisResult.missingSkills || []).join(", ")}

Return structured JSON ONLY:
{
  "skillsSuggestions": [],
  "experienceSuggestions": [],
  "projectSuggestions": [],
  "atsTips": []
}
`;

    // 1️⃣ Call Groq (chat-based)
    const response = await generateWithGroq([
      {
        role: "system",
        content:
          "You are a strict JSON-only ATS optimization API. Never invent skills or experience."
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    // 2️⃣ Extract Groq response text
    const responseText = response.choices[0].message.content;

    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Groq returned an empty response for JD suggestions");
    }

    // 3️⃣ Clean markdown if any
    let cleanJSON = responseText.replace(/```json|```/g, "").trim();

    // 4️⃣ Extract JSON safely
    const jsonMatch = cleanJSON.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJSON = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(cleanJSON);

      // 5️⃣ Validate structure
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Parsed JSON is not a valid object");
      }

      // 6️⃣ Normalize output (never undefined)
      return {
        skillsSuggestions: parsed.skillsSuggestions || [],
        experienceSuggestions: parsed.experienceSuggestions || [],
        projectSuggestions: parsed.projectSuggestions || [],
        atsTips: parsed.atsTips || []
      };
    } catch (parseError) {
      console.error("JSON Parse Error (JD Suggestions):", parseError.message);
      console.error(
        "Raw Response (first 500 chars):",
        responseText.substring(0, 500)
      );
      console.error(
        "Attempted to parse:",
        cleanJSON.substring(0, 200)
      );
      throw new Error(
        `Failed to parse AI response into JSON for JD suggestions: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Groq JD Suggestions Error:", error);
    throw error;
  }
};
