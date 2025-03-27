-- First, create a function that will help us create/update the match_memories function
CREATE OR REPLACE FUNCTION create_match_memories_function(sql_function text)
RETURNS void AS $$
BEGIN
    EXECUTE sql_function;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then create the match_memories function
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
$$; 