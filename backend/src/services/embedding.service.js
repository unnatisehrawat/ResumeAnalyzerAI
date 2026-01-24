import axios from "axios";

// URL of the Python Embedding Microservice
const EMBEDDING_SERVICE_URL = "http://127.0.0.1:5050/embed";

/**
 * Generate embeddings for a given text by calling the Python Microservice
 * @param {string} text - The input text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
export const generateEmbeddings = async (text) => {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text input for embedding generation");
    }

    text = text.toLowerCase().trim();


    // Call the Python Flask API
    const response = await axios.post(EMBEDDING_SERVICE_URL, {
      text: text
    });

    if (response.data && response.data.embeddings) {
      // The API returns a list of lists (batch), we usually send 1 text so we take the first one
      // If the python script returns [ [0.1, 0.2...] ], we return [0.1, 0.2...]
      return response.data.embeddings[0];
    } else {
      throw new Error("Invalid response format from embedding service");
    }

  } catch (error) {
    console.error("Embedding Service Error:", error.message);

    // Fallback: If service is down, return a zero-vector or throw
    // For now, let's throw so the user knows to start the python script
    throw new Error(
      "Failed to generate embeddings. Is the Python service (colab_embeddings.py) running on port 5000?"
    );
  }
};
