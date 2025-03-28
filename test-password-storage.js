const { createClient } = require('@supabase/supabase-js');
const { generateMockEmbedding } = require('./utils/vector-utils');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function storeTestPassword() {
    try {
        console.log('Starting password storage test...');

        // Test data
        const testMemory = {
            content: "TestPW is hotpup",
            metadata: {
                type: "password",
                keyword: "TestPW",
                timestamp: new Date().toISOString()
            }
        };

        // Generate mock embedding
        console.log('Generating mock embedding...');
        const embedding = generateMockEmbedding();

        // Save to Supabase
        console.log('Saving to Supabase...');
        const { data, error } = await supabase
            .from('ai_memory')
            .insert([{
                content: testMemory.content,
                embedding,
                metadata: testMemory.metadata
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('Successfully saved password:', data);

        // Verify retrieval
        console.log('\nVerifying retrieval...');
        const { data: retrievedData, error: retrievalError } = await supabase
            .from('ai_memory')
            .select('*')
            .eq('id', data.id)
            .single();

        if (retrievalError) {
            throw retrievalError;
        }

        console.log('Successfully retrieved password:', retrievedData);

        // Test keyword search
        console.log('\nTesting keyword search...');
        const { data: searchResults, error: searchError } = await supabase
            .from('ai_memory')
            .select('*')
            .contains('metadata', { keyword: 'TestPW' });

        if (searchError) {
            throw searchError;
        }

        console.log('Keyword search results:', searchResults);

        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

storeTestPassword(); 