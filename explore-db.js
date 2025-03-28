require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { generateMockEmbedding } = require('./utils/vector-utils');

console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');

// Check environment variables first
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('\n❌ Error: Missing environment variables');
    console.error('Please ensure SUPABASE_URL and SUPABASE_KEY are set in your .env file\n');
    process.exit(1);
}

let supabase;
try {
    console.log('Creating Supabase client...');
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );
    console.log('Supabase client created successfully');
} catch (error) {
    console.error('Error creating Supabase client:', error);
    console.trace('Stack trace:');
    process.exit(1);
}

// Helper function for section headers
function printHeader(text) {
    console.log('\n' + '='.repeat(80));
    console.log(text.toUpperCase());
    console.log('='.repeat(80) + '\n');
}

// Helper function for section content
function printSection(text) {
    console.log('\n' + '-'.repeat(40));
    console.log(text);
    console.log('-'.repeat(40) + '\n');
}

async function exploreDatabase() {
    try {
        printHeader('Starting Database Exploration');

        // 1. List all tables
        printSection('1. Available Tables');
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_tables');
        
        if (tablesError) {
            console.error('Error fetching tables:', tablesError);
            console.log('Attempting direct table access...');
            
            // Try accessing known tables directly
            const tables = ['ai_memory', 'documents', 'document_chunks'];
            for (const table of tables) {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (!error) {
                    console.log(`Table '${table}' exists with ${count} records`);
                }
            }
        } else {
            console.log('Tables found:', tables.join(', '), '\n');
        }

        // 2. Count records in ai_memory
        printSection('2. Count of Records in ai_memory');
        const { count: memoryCount, error: countError } = await supabase
            .from('ai_memory')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('Error counting memories:', countError);
            throw countError;
        }
        console.log(`Total memories: ${memoryCount}\n`);

        // 3. Show sample memories with their metadata
        printSection('3. Sample Memories (Last 5)');
        const { data: memories, error: memoriesError } = await supabase
            .from('ai_memory')
            .select('id, content, metadata, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (memoriesError) {
            console.error('Error fetching memories:', memoriesError);
            throw memoriesError;
        }
        console.log('Recent memories:', JSON.stringify(memories, null, 2), '\n');

        // 4. Test similarity search
        printSection('4. Testing Similarity Search');
        const mockEmbedding = generateMockEmbedding();
        const { data: similarMemories, error: searchError } = await supabase
            .rpc('similarity_search', {
                query_embedding: mockEmbedding,
                similarity_threshold: 0.5,
                max_results: 3
            });
        
        if (searchError) {
            console.error('Error performing similarity search:', searchError);
            throw searchError;
        }
        console.log('Similar memories found:', similarMemories.length);
        console.log('Results:', JSON.stringify(similarMemories, null, 2), '\n');

        // 5. Show unique metadata types
        printSection('5. Unique Metadata Types');
        const { data: metadataTypes, error: metadataError } = await supabase
            .from('ai_memory')
            .select('metadata')
            .not('metadata', 'eq', '{}');
        
        if (metadataError) {
            console.error('Error fetching metadata types:', metadataError);
            throw metadataError;
        }
        const uniqueTypes = [...new Set(metadataTypes.map(m => Object.keys(m.metadata)).flat())];
        console.log('Types found:', uniqueTypes.join(', '), '\n');

        // 6. Count by metadata type
        printSection('6. Count by Metadata Type');
        const typeCounts = {};
        metadataTypes.forEach(m => {
            Object.keys(m.metadata).forEach(type => {
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });
        });
        console.log('Type counts:', JSON.stringify(typeCounts, null, 2), '\n');

        printHeader('Database Exploration Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Error exploring database:');
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the exploration
exploreDatabase(); 