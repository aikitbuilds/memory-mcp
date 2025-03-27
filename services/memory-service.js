const { generateEmbedding, generateMockEmbedding } = require('../utils/vector-utils');
const supabaseService = require('./supabase-service');

class MemoryService {
    /**
     * Save a new memory
     * @param {string} content - The content to save
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} The saved memory
     */
    async saveMemory(content, metadata = {}) {
        try {
            // Generate embedding for the content
            const embedding = await generateEmbedding(content);
            
            // Save to Supabase
            const memory = await supabaseService.saveMemory({
                content,
                embedding,
                metadata
            });

            return memory;
        } catch (error) {
            console.error('Error saving memory:', error);
            throw error;
        }
    }

    /**
     * Search for similar memories
     * @param {string} query - The search query
     * @param {number} limit - Maximum number of results
     * @param {number} threshold - Similarity threshold
     * @returns {Promise<Object[]>} Similar memories
     */
    async searchMemories(query, limit = 5, threshold = 0.7) {
        try {
            // Generate embedding for the query
            const queryEmbedding = await generateEmbedding(query);
            
            // Search in Supabase
            const memories = await supabaseService.findSimilarMemories(
                queryEmbedding,
                limit,
                threshold
            );

            return memories;
        } catch (error) {
            console.error('Error searching memories:', error);
            throw error;
        }
    }

    /**
     * List all memories
     * @returns {Promise<Object[]>} List of memories
     */
    async listMemories() {
        try {
            return await supabaseService.listMemories();
        } catch (error) {
            console.error('Error listing memories:', error);
            throw error;
        }
    }

    /**
     * Delete a memory
     * @param {string} id - Memory ID to delete
     * @returns {Promise<void>}
     */
    async deleteMemory(id) {
        try {
            await supabaseService.deleteMemory(id);
        } catch (error) {
            console.error('Error deleting memory:', error);
            throw error;
        }
    }
}

module.exports = new MemoryService(); 