const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

class SupabaseService {
    constructor() {
        this.supabase = createClient(config.supabase.url, config.supabase.key);
        this.tableName = config.supabase.tables.memory;
    }

    async saveMemory(content, embedding, metadata = {}) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert([{
                    content,
                    embedding,
                    metadata,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            throw new Error(`Failed to save memory: ${error.message}`);
        }
    }

    async findSimilarMemories(queryEmbedding, limit = config.defaults.maxResults) {
        try {
            const { data, error } = await this.supabase
                .rpc('match_memories', {
                    query_embedding: queryEmbedding,
                    match_threshold: config.defaults.similarityThreshold,
                    match_count: limit
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error searching memories:', error);
            throw new Error(`Failed to search memories: ${error.message}`);
        }
    }

    async listMemories() {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('content, metadata, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error listing memories:', error);
            throw new Error(`Failed to list memories: ${error.message}`);
        }
    }

    async deleteMemory(id) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting memory:', error);
            throw new Error(`Failed to delete memory: ${error.message}`);
        }
    }
}

module.exports = new SupabaseService(); 