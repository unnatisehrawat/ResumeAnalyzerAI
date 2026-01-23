import { generateWithGroq } from "./groq.service.js";

/**
 * Generate interview questions from parsed resume + JD
 * Fully aligned with parseResumeWithAI & parseJDWithAI
 */
export const generateInterviewQuestions = async (resumeData, jdData) => {
  // ✅ Normalize Resume
  const normalizedResume = {
    skills: resumeData.skills || [],
    projects: (resumeData.projects || []).map(p => ({
      title: p.name || "",
      description: p.description || "",
      technologies: p.technologies || []
    })),
    experience: resumeData.experience || []
  };

  // ✅ Normalize JD (VERY IMPORTANT)
  const normalizedJD = {
    title: jdData.experienceLevel || "Job Role",
    description: [
      ...(jdData.responsibilities || []),
      ...(jdData.keywords || [])
    ].join(". "),
    requiredSkills: jdData.requiredSkills || [],
    preferredSkills: jdData.preferredSkills || []
  };

  const prompt = `
You are a technical interviewer.

Based on this resume and job description, generate:
1. 5 Technical Questions with answers and difficulty levels.
2. 3 Behavioral Questions using the STAR method.

Resume:
${JSON.stringify(normalizedResume, null, 2)}

Job Description:
${JSON.stringify(normalizedJD, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "technicalQuestions": [
    {
      "question": "",
      "answer": "",
      "difficulty": "Easy | Medium | Hard",
      "tags": []
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "situation": "",
      "task": "",
      "action": "",
      "result": ""
    }
  ]
}
`;

  const response = await generateWithGroq([
    { role: "system", content: "You are a strict JSON-only API." },
    { role: "user", content: prompt }
  ]);

  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};
