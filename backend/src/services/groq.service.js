import Groq from "groq-sdk";

// Create Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generic function to call Groq LLM
 * Accepts a messages array in OpenAI chat format
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Object} - Full Groq completion response
 */
export const generateWithGroq = async (messages) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", 
    messages: messages,
    temperature: 0.3
  });

  return completion;
};
