/**
 * Robustly extract and parse JSON from an LLM response string.
 * Handles markdown blocks and trailing commas.
 */
export const parseLLMJson = (text) => {
    if (!text || typeof text !== "string") return null;

    try {
        // 1. Remove markdown code blocks if present
        let cleaned = text.replace(/```json|```/g, "").trim();

        // 2. Locate the first { and last } to isolate the JSON object
        const startIndex = cleaned.indexOf("{");
        const endIndex = cleaned.lastIndexOf("}");

        if (startIndex === -1 || endIndex === -1) {
            console.error("No JSON object found in LLM response");
            return null;
        }

        cleaned = cleaned.substring(startIndex, endIndex + 1);

        // 3. Remove trailing commas before ] or }
        cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parsing failed in parseLLMJson:", error.message);
        console.debug("Problematic text:", text);
        return null;
    }
};
