require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function fixMatchMemoriesFunction() {
    console.log('Fixing match_memories function...');
    
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
        // SQL to create or replace the match_memories function
        const { data, error } = await supabase.rpc('create_match_memories_function', {
            sql_function: `
            CREATE OR REPLACE FUNCTION match_memories(
                query_embedding vector(1536),
                match_threshold float,
                match_count int
            )
            RETURNS TABLE (
                memory_id uuid,
                content text,
                metadata jsonb,
                similarity float
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    m.id as memory_id,
                    m.content,
                    m.metadata,
                    1 - (m.embedding <=> query_embedding) as similarity
                FROM ai_memory m
                WHERE 1 - (m.embedding <=> query_embedding) > match_threshold
                ORDER BY similarity DESC
                LIMIT match_count;
            END;
            $$;`
        });

        if (error) {
            throw new Error(`Failed to update match_memories function: ${error.message}`);
        }

        console.log('✓ Successfully updated match_memories function');
        
        // Test the updated function
        const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        const { data: testData, error: testError } = await supabase.rpc('match_memories', {
            query_embedding: mockEmbedding,
            match_threshold: 0.5,
            match_count: 5
        });

        if (testError) {
            throw new Error(`Test failed: ${testError.message}`);
        }

        console.log('\nTest search results:');
        console.log(JSON.stringify(testData, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixMatchMemoriesFunction(); 