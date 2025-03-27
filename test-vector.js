require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

async function testVectorOperations() {
    console.log('Starting vector operations test...');
    console.log('Process working directory:', process.cwd());

    try {
        // Check environment variables
        console.log('\nChecking environment variables...');
        const requiredEnvVars = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
            console.log(`✓ ${envVar} is set`);
        }

        // Initialize OpenAI
        console.log('\nInitializing OpenAI client...');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✓ OpenAI client initialized');

        // Initialize Supabase
        console.log('\nInitializing Supabase client...');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        console.log('✓ Supabase client initialized');

        // Test data
        const testContent = "Meeting notes from 2024-03-20: Discussed Project Phoenix launch strategy, focus on social media push.";
        console.log('\nTest content:', testContent);

        // Generate embedding
        console.log('\nGenerating embedding for test content...');
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: testContent
        });
        const embedding = embeddingResponse.data[0].embedding;
        console.log('✓ Embedding generated successfully');
        console.log('Embedding length:', embedding.length);

        // Insert test data with embedding
        console.log('\nInserting test data into database...');
        const { data: insertData, error: insertError } = await supabase
            .from('ai_memory')
            .insert([{
                content: testContent,
                embedding: embedding,
                metadata: { type: 'test', project: 'Phoenix' }
            }])
            .select();

        if (insertError) {
            throw new Error(`Insert error: ${insertError.message}`);
        }
        console.log('✓ Test data inserted successfully');
        console.log('Inserted data:', insertData);

        // Test similarity search
        console.log('\nTesting similarity search...');
        const searchQuery = "What was discussed about Phoenix?";
        console.log('Search query:', searchQuery);

        const searchEmbedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: searchQuery
        });
        console.log('✓ Search embedding generated');

        const { data: searchData, error: searchError } = await supabase
            .rpc('match_memories', {
                query_embedding: searchEmbedding.data[0].embedding,
                match_threshold: 0.7,
                match_count: 5
            });

        if (searchError) {
            throw new Error(`Search error: ${searchError.message}`);
        }

        console.log('\nSearch results:');
        console.log(JSON.stringify(searchData, null, 2));

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test
console.log('='.repeat(50));
testVectorOperations()
    .then(() => {
        console.log('\n✓ Test completed successfully');
        console.log('='.repeat(50));
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        console.log('='.repeat(50));
        process.exit(1);
    }); 