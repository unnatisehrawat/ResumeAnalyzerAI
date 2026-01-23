import fs from "fs";
import { createRequire } from "module";
import { generateWithGroq } from "./groq.service.js";

const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");

// pdf-parse@2.4.5 uses a class-based API
const PDFParse = pdfModule.PDFParse;

/* ===============================
   PDF TEXT EXTRACTION
   =============================== */
export const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);

  // Instantiate PDFParse and extract text
  const parser = new PDFParse(new Uint8Array(buffer));
  const result = await parser.getText();

  return result.text;
};

/* ===============================
   RESUME PARSING WITH GROQ
   =============================== */
export const parseResumeWithAI = async (resumeText) => {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error("Resume text is empty or invalid");
  }

  // Warn if text is suspiciously short
  if (resumeText.trim().length < 50) {
    console.warn(
      "Resume text is very short:",
      resumeText.length,
      "characters"
    );
  }

  console.log("Starting Resume Parsing with Groq...");

  const prompt = `
You are an ATS resume parser.

CRITICAL RULES:
- Return ONLY valid JSON
- No explanations
- No markdown
- Do NOT invent skills or experience

Return this exact JSON structure:
{
  "totalYearsExperience": number,
  "skills": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "technologies": ["string"],
      "impact": "string"
    }
  ],
  "education": ["string"],
  "projects": [
    {
      "name": "string",
      "technologies": ["string"],
      "description": "string"
    }
  ]
}

Resume Text:
"""
${resumeText}
"""

Return ONLY the JSON object.
`;

  // 1️⃣ Call Groq
  const response = await generateWithGroq([
    {
      role: "system",
      content:
        "You are a strict JSON-only ATS resume parsing API."
    },
    {
      role: "user",
      content: prompt
    }
  ]);

  // 2️⃣ Extract text
  const responseText = response.choices[0].message.content;

  if (!responseText || responseText.trim().length === 0) {
    throw new Error("Groq returned an empty response for resume parsing");
  }

  console.log("AI Raw Response Length:", responseText.length);

  // 3️⃣ Clean markdown if any
  let cleanJSON = responseText.replace(/```json|```/g, "").trim();

  // 4️⃣ Extract JSON safely
  const jsonMatch = cleanJSON.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanJSON = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleanJSON);

    // 5️⃣ Normalize output (never undefined)
    return {
      totalYearsExperience: parsed.totalYearsExperience || 0,
      skills: parsed.skills || [],
      experience: parsed.experience || [],
      education: parsed.education || [],
      projects: parsed.projects || []
    };
  } catch (error) {
    console.error("Resume JSON Parse Error:", error.message);
    console.error(
      "Raw Response (first 500 chars):",
      responseText.substring(0, 500)
    );
    console.error(
      "Attempted to parse:",
      cleanJSON.substring(0, 200)
    );
    throw new Error(
      `Failed to parse resume into structured JSON: ${error.message}`
    );
  }
};
