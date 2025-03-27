const mcpServer = require('./index');

async function testMemoryServer() {
    try {
        // Test saving memory
        console.log('\n1. Testing saveMemory...');
        const saveResult = await mcpServer.handleRequest({
            tool: 'saveMemory',
            params: {
                key: 'greeting',
                value: 'Hello persistent world!'
            }
        });
        console.log('Save result:', saveResult);

        // Test recalling memory
        console.log('\n2. Testing recallMemory...');
        const recallResult = await mcpServer.handleRequest({
            tool: 'recallMemory',
            params: {
                key: 'greeting'
            }
        });
        console.log('Recall result:', recallResult);

        // Test listing keys
        console.log('\n3. Testing listMemoryKeys...');
        const listResult = await mcpServer.handleRequest({
            tool: 'listMemoryKeys',
            params: {}
        });
        console.log('List result:', listResult);

        // Test deleting memory
        console.log('\n4. Testing deleteMemory...');
        const deleteResult = await mcpServer.handleRequest({
            tool: 'deleteMemory',
            params: {
                key: 'greeting'
            }
        });
        console.log('Delete result:', deleteResult);

        // Verify deletion by trying to recall
        console.log('\n5. Verifying deletion...');
        const verifyResult = await mcpServer.handleRequest({
            tool: 'recallMemory',
            params: {
                key: 'greeting'
            }
        });
        console.log('Verify result:', verifyResult);

        // Test error handling
        console.log('\n6. Testing error handling...');
        try {
            await mcpServer.handleRequest({
                tool: 'saveMemory',
                params: {
                    key: 'test'
                    // Missing value parameter
                }
            });
        } catch (error) {
            console.log('Expected error caught:', error.message);
        }

        // Final state check
        console.log('\n7. Final memory state:');
        const finalState = await mcpServer.handleRequest({
            tool: 'listMemoryKeys',
            params: {}
        });
        console.log('Keys in memory:', finalState);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run tests
console.log('Starting memory server tests...');
testMemoryServer().then(() => {
    console.log('\nTests completed.');
}); 