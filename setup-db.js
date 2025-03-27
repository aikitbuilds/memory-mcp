require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('Setting up database functions...');
    
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'create_similarity_search.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_string: sqlContent
        });

        if (error) {
            throw new Error(`Failed to execute SQL: ${error.message}`);
        }

        console.log('✓ Successfully created similarity_search function');
        
        // Test the function
        const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        const { data: testData, error: testError } = await supabase.rpc('similarity_search', {
            query_embedding: mockEmbedding,
            similarity_threshold: 0.0,
            max_results: 5
        });

        if (testError) {
            throw new Error(`Test failed: ${testError.message}`);
        }

        console.log('\nTest query successful!');
        console.log('Results:', JSON.stringify(testData, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

setupDatabase(); 