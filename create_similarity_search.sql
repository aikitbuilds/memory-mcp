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