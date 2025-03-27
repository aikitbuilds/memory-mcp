require('dotenv').config();

const config = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'text-embedding-ada-002',
        dimensions: 1536 // Dimensions of the embedding vector for Ada-002
    },
    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
        tables: {
            memory: 'ai_memory'
        }
    },
    defaults: {
        similarityThreshold: 0.7, // Cosine similarity threshold
        maxResults: 5 // Maximum number of similar results to return
    }
};

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config; 