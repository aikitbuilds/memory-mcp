const fs = require('fs').promises;
const path = require('path');
const config = require('./config/config');
const embeddingService = require('./services/embedding-service');
const supabaseService = require('./services/supabase-service');

// Legacy file-based memory store (keeping for backward compatibility)
const MEMORY_FILE = path.join(__dirname, 'memory.json');
let memoryStore = {};

// Initialize memory store
async function initializeMemoryStore() {
    try {
        try {
            const data = await fs.readFile(MEMORY_FILE, 'utf8');
            memoryStore = JSON.parse(data || '{}');
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(MEMORY_FILE, JSON.stringify({}, null, 2));
            } else {
                await fs.writeFile(MEMORY_FILE, JSON.stringify({}, null, 2));
            }
            memoryStore = {};
        }
        return true;
    } catch (error) {
        console.error('Error initializing memory store:', error);
        throw error;
    }
}

// Save memory to disk (legacy method)
async function saveToDisk() {
    try {
        await fs.writeFile(MEMORY_FILE, JSON.stringify(memoryStore, null, 2));
    } catch (error) {
        console.error('Error saving to disk:', error);
        throw error;
    }
}

// MCP server implementation
const mcpServer = {
    name: 'memory-mcp-server',
    version: '1.0.0',
    
    tools: {
        // Legacy tools (file-based)
        async saveMemory(params) {
            const { key, value } = params;
            if (!key || !value) {
                throw new Error('Both key and value are required');
            }
            
            memoryStore[key] = value;
            await saveToDisk();
            return `Value saved for key: ${key}`;
        },

        async recallMemory(params) {
            const { key } = params;
            if (!key) {
                throw new Error('Key is required');
            }
            
            const value = memoryStore[key];
            return value !== undefined ? value : `Key not found: ${key}`;
        },

        async listMemoryKeys() {
            return Object.keys(memoryStore);
        },

        async deleteMemory(params) {
            const { key } = params;
            if (!key) {
                throw new Error('Key is required');
            }
            
            if (key in memoryStore) {
                delete memoryStore[key];
                await saveToDisk();
                return `Deleted key: ${key}`;
            }
            return `Key not found: ${key}`;
        },

        // New semantic search tools
        async saveAndEmbedMemory(params) {
            const { content, metadata = {} } = params;
            if (!content) {
                throw new Error('Content is required');
            }

            try {
                const embedding = await embeddingService.generateEmbedding(content);
                const result = await supabaseService.saveMemory(content, embedding, metadata);
                return {
                    message: 'Memory saved with embedding',
                    id: result.id,
                    content: result.content
                };
            } catch (error) {
                throw new Error(`Failed to save and embed memory: ${error.message}`);
            }
        },

        async searchSimilarMemory(params) {
            const { queryText, limit = config.defaults.maxResults } = params;
            if (!queryText) {
                throw new Error('Query text is required');
            }

            try {
                const queryEmbedding = await embeddingService.generateEmbedding(queryText);
                const results = await supabaseService.findSimilarMemories(queryEmbedding, limit);
                
                return results.map(result => ({
                    content: result.content,
                    similarity: result.similarity,
                    metadata: result.metadata
                }));
            } catch (error) {
                throw new Error(`Failed to search similar memories: ${error.message}`);
            }
        },

        async listAllMemories() {
            try {
                return await supabaseService.listMemories();
            } catch (error) {
                throw new Error(`Failed to list memories: ${error.message}`);
            }
        }
    },

    async handleRequest(request) {
        const { tool, params } = request;
        
        if (!this.tools[tool]) {
            throw new Error(`Tool ${tool} not found`);
        }

        return await this.tools[tool](params);
    }
};

// Initialize and start the server
async function startServer() {
    try {
        await initializeMemoryStore();
        console.log('Memory MCP server initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize server:', error);
        throw error;
    }
}

// Export the MCP server
module.exports = mcpServer;

// If this file is run directly (not required as a module)
if (require.main === module) {
    startServer().catch(error => {
        console.error('Server startup failed:', error);
        process.exit(1);
    });
} 