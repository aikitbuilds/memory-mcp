require('dotenv').config();
const express = require('express');
const cors = require('cors');
const memoryService = require('./services/memory-service');
const geminiService = require('./services/gemini-service');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/memory', async (req, res) => {
    try {
        const { content, metadata } = req.body;
        const memory = await memoryService.saveMemory(content, metadata);
        res.json(memory);
    } catch (error) {
        console.error('Error saving memory:', error);
        res.status(500).json({ error: 'Failed to save memory' });
    }
});

app.get('/memory/search', async (req, res) => {
    try {
        const { query, limit, threshold } = req.query;
        const memories = await memoryService.searchMemories(
            query,
            parseInt(limit) || 5,
            parseFloat(threshold) || 0.7
        );
        res.json(memories);
    } catch (error) {
        console.error('Error searching memories:', error);
        res.status(500).json({ error: 'Failed to search memories' });
    }
});

app.get('/memory', async (req, res) => {
    try {
        const memories = await memoryService.listMemories();
        res.json(memories);
    } catch (error) {
        console.error('Error listing memories:', error);
        res.status(500).json({ error: 'Failed to list memories' });
    }
});

app.delete('/memory/:id', async (req, res) => {
    try {
        await memoryService.deleteMemory(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting memory:', error);
        res.status(500).json({ error: 'Failed to delete memory' });
    }
});

// New chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await geminiService.sendMessage(message);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// Reset chat endpoint
app.post('/chat/reset', async (req, res) => {
    try {
        await geminiService.resetChat();
        res.json({ message: 'Chat history reset successfully' });
    } catch (error) {
        console.error('Error resetting chat:', error);
        res.status(500).json({ error: 'Failed to reset chat' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
    console.log(`Memory MCP Server running on port ${port}`);
}); 