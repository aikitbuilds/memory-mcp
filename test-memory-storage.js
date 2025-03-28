require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { generateMockEmbedding } = require('./utils/vector-utils');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function testMemoryStorage() {
    try {
        console.log('Starting memory storage test...');

        // Test data
        const testMemory = {
            content: "This is a test memory to verify storage in Supabase database.",
            metadata: {
                test: true,
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

        console.log('Successfully saved memory:', data);

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

        console.log('Successfully retrieved memory:', retrievedData);

        // Test similarity search
        console.log('\nTesting similarity search...');
        const { data: searchResults, error: searchError } = await supabase
            .rpc('similarity_search', {
                query_embedding: embedding,
                similarity_threshold: 0.7,
                max_results: 5
            });

        if (searchError) {
            throw searchError;
        }

        console.log('Similarity search results:', searchResults);

        // Cleanup
        console.log('\nCleaning up test data...');
        const { error: deleteError } = await supabase
            .from('ai_memory')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            throw deleteError;
        }

        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testMemoryStorage(); 