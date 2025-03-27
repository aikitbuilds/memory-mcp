require('dotenv').config();
const fetch = require('node-fetch');

async function testVectorOperations() {
    console.log('Starting vector operations test with mock data...');
    console.log('Process working directory:', process.cwd());

    try {
        // Create mock embedding (1536 dimensions, random values between -1 and 1)
        const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        console.log('✓ Mock embedding created');
        console.log('Embedding length:', mockEmbedding.length);

        // Test data
        const testContent = "Meeting notes from 2024-03-20: Discussed Project Phoenix launch strategy, focus on social media push.";
        console.log('\nTest content:', testContent);

        // Insert test data with mock embedding
        console.log('\nInserting test data into database...');
        const insertResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/ai_memory`, {
            method: 'POST',
            headers: {
                'apikey': process.env.SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                content: testContent,
                embedding: mockEmbedding,
                metadata: { type: 'test', project: 'Phoenix' }
            })
        });

        if (!insertResponse.ok) {
            throw new Error(`Insert error: ${insertResponse.statusText}`);
        }
        console.log('✓ Test data inserted successfully');

        // Test similarity search with another mock embedding
        console.log('\nTesting similarity search...');
        const mockQueryEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        console.log('✓ Mock query embedding created');

        // Use a direct SQL query for similarity search
        const searchResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/ai_memory?select=id,content,metadata,embedding&order=embedding.<=>.${mockQueryEmbedding.join(',')}&limit=5`, {
            method: 'GET',
            headers: {
                'apikey': process.env.SUPABASE_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!searchResponse.ok) {
            throw new Error(`Search error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
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