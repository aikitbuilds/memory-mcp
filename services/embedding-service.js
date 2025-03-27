const OpenAI = require('openai');
const config = require('../config/config');

class EmbeddingService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: config.openai.apiKey
        });
    }

    async generateEmbedding(text) {
        try {
            const response = await this.openai.embeddings.create({
                model: config.openai.model,
                input: text
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    // Calculate cosine similarity between two vectors
    calculateCosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Vectors must have the same dimensions');
        }

        const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
        const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

        return dotProduct / (magnitudeA * magnitudeB);
    }
}

module.exports = new EmbeddingService(); 