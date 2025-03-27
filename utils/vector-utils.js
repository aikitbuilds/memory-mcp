const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate embedding for a given text using OpenAI's API
 * @param {string} text - The text to generate embedding for
 * @returns {Promise<number[]>} The embedding vector
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} Cosine similarity score
 */
function cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
        throw new Error('Vectors must have the same length');
    }

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (norm1 * norm2);
}

/**
 * Generate a mock embedding for testing
 * @param {number} dimensions - Number of dimensions for the embedding
 * @returns {number[]} Mock embedding vector
 */
function generateMockEmbedding(dimensions = 1536) {
    return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
}

module.exports = {
    generateEmbedding,
    cosineSimilarity,
    generateMockEmbedding
}; 