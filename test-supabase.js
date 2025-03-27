require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
    console.log('Starting Supabase connection test...');
    console.log('Process working directory:', process.cwd());

    try {
        // Check environment variables
        console.log('\nEnvironment check:');
        if (!process.env.SUPABASE_URL) {
            throw new Error('SUPABASE_URL is not set in environment variables');
        }
        if (!process.env.SUPABASE_KEY) {
            throw new Error('SUPABASE_KEY is not set in environment variables');
        }
        console.log('✓ Environment variables are set');

        // Initialize Supabase client
        console.log('\nInitializing Supabase client...');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        console.log('✓ Supabase client initialized');

        // Test connection
        console.log('\nTesting database connection...');
        const { data, error } = await supabase
            .from('ai_memory')
            .select('count')
            .single();

        if (error) {
            if (error.message.includes('relation "ai_memory" does not exist')) {
                console.log('\n❌ Table "ai_memory" does not exist');
                console.log('\nPlease run this SQL in your Supabase SQL editor:');
                console.log(`
-- Enable vector extension
create extension if not exists vector;

-- Create ai_memory table
create table ai_memory (
    id uuid primary key default uuid_generate_v4(),
    content text not null,
    embedding vector(1536),
    metadata jsonb default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create similarity search function
create or replace function match_memories(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
returns table (
    id uuid,
    content text,
    similarity float,
    metadata jsonb
)
language plpgsql
as $$
begin
    return query
    select
        id,
        content,
        1 - (embedding <=> query_embedding) as similarity,
        metadata
    from ai_memory
    where 1 - (embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count;
end;
$$;`);
            } else {
                throw new Error(`Database error: ${error.message}`);
            }
        } else {
            console.log('✓ Successfully connected to database');
            console.log('Current table state:', data);
        }

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
testSupabaseConnection()
    .then(() => {
        console.log('\n✓ Test completed successfully');
        console.log('='.repeat(50));
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        console.log('='.repeat(50));
        process.exit(1);
    }); 