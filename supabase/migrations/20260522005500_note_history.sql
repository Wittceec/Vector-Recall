create table public.note_history (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  content_markdown text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.note_history enable row level security;

create policy "Users can view their own note history" on public.note_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own note history" on public.note_history
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own note history" on public.note_history
  for delete using (auth.uid() = user_id);
