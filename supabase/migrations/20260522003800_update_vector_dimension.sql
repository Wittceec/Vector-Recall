-- Drop the existing function first since it depends on the column type
drop function if exists match_notes;

-- Alter the notes.embedding column to vector(384)
alter table public.notes alter column embedding type vector(384);

-- Recreate the function with vector(384)
create or replace function match_notes(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  title text,
  similarity float
)
language sql
as $$
  select
    id,
    title,
    1 - (notes.embedding <=> query_embedding) as similarity
  from notes
  where user_id = p_user_id
    and 1 - (notes.embedding <=> query_embedding) > match_threshold
  order by (notes.embedding <=> query_embedding) asc
  limit match_count;
$$;
