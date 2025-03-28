const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const memoryService = require('./memory-service');

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
        this.chat = this.model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: config.gemini.maxOutputTokens,
                temperature: config.gemini.temperature,
                topP: config.gemini.topP,
                topK: config.gemini.topK,
            },
        });
    }

    async sendMessage(message, context = []) {
        try {
            // Search for relevant memories
            const relevantMemories = await memoryService.searchMemories(message);
            
            // Construct context from memories
            const memoryContext = relevantMemories
                .map(memory => `Memory: ${memory.content}`)
                .join('\n');

            // Add memory context to the message
            const enhancedMessage = memoryContext 
                ? `${message}\n\nRelevant context:\n${memoryContext}`
                : message;

            // Send message to Gemini
            const result = await this.chat.sendMessage(enhancedMessage);
            const response = await result.response;
            const text = response.text();

            // Store the interaction in memory
            await memoryService.saveMemory(message, {
                type: 'user_message',
                timestamp: new Date().toISOString()
            });

            await memoryService.saveMemory(text, {
                type: 'assistant_response',
                timestamp: new Date().toISOString()
            });

            return text;
        } catch (error) {
            console.error('Error in Gemini chat:', error);
            throw new Error(`Failed to process chat message: ${error.message}`);
        }
    }

    async resetChat() {
        this.chat = this.model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: config.gemini.maxOutputTokens,
                temperature: config.gemini.temperature,
                topP: config.gemini.topP,
                topK: config.gemini.topK,
            },
        });
    }
}

module.exports = new GeminiService(); 