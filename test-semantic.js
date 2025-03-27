const mcpServer = require('./index');

async function testSemanticSearch() {
    try {
        console.log('\n1. Testing saveAndEmbedMemory...');
        const memories = [
            {
                content: "Meeting notes from 2024-03-20: Discussed Project Phoenix launch strategy, focus on social media push.",
                metadata: { type: 'meeting', project: 'Phoenix' }
            },
            {
                content: "Risk assessment for Project Phoenix: Potential competitor launching similar product in Q2.",
                metadata: { type: 'risk', project: 'Phoenix' }
            },
            {
                content: "Marketing budget allocation: $50K for Project Phoenix social media campaign.",
                metadata: { type: 'budget', project: 'Phoenix' }
            }
        ];

        for (const memory of memories) {
            const saveResult = await mcpServer.handleRequest({
                tool: 'saveAndEmbedMemory',
                params: memory
            });
            console.log('Save result:', saveResult);
        }

        // Test semantic search
        console.log('\n2. Testing searchSimilarMemory...');
        const queries = [
            "What were the key points about the Phoenix launch?",
            "Any risks identified for the project?",
            "Tell me about the marketing budget"
        ];

        for (const queryText of queries) {
            console.log(`\nSearching for: "${queryText}"`);
            const searchResult = await mcpServer.handleRequest({
                tool: 'searchSimilarMemory',
                params: { queryText }
            });
            console.log('Search results:', JSON.stringify(searchResult, null, 2));
        }

        // List all memories
        console.log('\n3. Testing listAllMemories...');
        const listResult = await mcpServer.handleRequest({
            tool: 'listAllMemories',
            params: {}
        });
        console.log('All memories:', JSON.stringify(listResult, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run tests
console.log('Starting semantic search tests...');
testSemanticSearch().then(() => {
    console.log('\nTests completed.');
}); 