-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the ai_memory table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_memory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    content text NOT NULL,
    embedding vector(1536) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the similarity_search function
CREATE OR REPLACE FUNCTION similarity_search(
    query_embedding vector(1536),
    similarity_threshold float,
    max_results int
) RETURNS TABLE (
    id uuid,
    content text,
    metadata jsonb,
    similarity float
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.content,
        m.metadata,
        1 - (m.embedding <=> query_embedding) as similarity
    FROM ai_memory m
    WHERE 1 - (m.embedding <=> query_embedding) > similarity_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT max_results;
END;
$$;

-- Create an index for faster similarity search
CREATE INDEX IF NOT EXISTS ai_memory_embedding_idx ON ai_memory USING ivfflat (embedding vector_cosine_ops);

-- Grant necessary permissions
GRANT ALL ON TABLE ai_memory TO authenticated;
GRANT ALL ON TABLE ai_memory TO service_role;
GRANT EXECUTE ON FUNCTION similarity_search TO authenticated;
GRANT EXECUTE ON FUNCTION similarity_search TO service_role; 