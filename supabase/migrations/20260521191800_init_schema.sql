-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Create tables
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null default 'Untitled Note',
  content_markdown text not null default '',
  embedding vector(768), -- adjust dimensions based on embedding model, typically 768 for small models, 1536 for text-embedding-3-small
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  unique (user_id, name)
);

create table public.note_tags (
  note_id uuid references public.notes on delete cascade,
  tag_id uuid references public.tags on delete cascade,
  primary key (note_id, tag_id)
);

create table public.note_links (
  source_id uuid references public.notes on delete cascade,
  target_id uuid references public.notes on delete cascade,
  primary key (source_id, target_id)
);

-- RLS Setup
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.note_tags enable row level security;
alter table public.note_links enable row level security;

-- Policies for notes
create policy "Users can view their own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- Policies for tags
create policy "Users can view their own tags" on public.tags
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tags" on public.tags
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tags" on public.tags
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tags" on public.tags
  for delete using (auth.uid() = user_id);

-- Policies for note_tags
create policy "Users can manage note_tags for their notes" on public.note_tags
  for all using (
    exists (
      select 1 from public.notes
      where notes.id = note_tags.note_id and notes.user_id = auth.uid()
    )
  );

-- Policies for note_links
create policy "Users can manage note_links for their notes" on public.note_links
  for all using (
    exists (
      select 1 from public.notes
      where notes.id = note_links.source_id and notes.user_id = auth.uid()
    )
  );

-- Function for similarity search
create or replace function match_notes(
  query_embedding vector(768),
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
