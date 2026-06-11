create table if not exists public.time_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    topic text not null,
    color text not null,
    duration_seconds integer not null,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security
alter table public.time_logs enable row level security;

-- Policies
create policy "Users can view their own time logs"
    on public.time_logs for select
    using ( auth.uid() = user_id );

create policy "Users can insert their own time logs"
    on public.time_logs for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own time logs"
    on public.time_logs for update
    using ( auth.uid() = user_id );

create policy "Users can delete their own time logs"
    on public.time_logs for delete
    using ( auth.uid() = user_id );

-- Create indexes for faster aggregation
create index time_logs_user_id_date_idx on public.time_logs (user_id, date);
create index time_logs_user_id_topic_idx on public.time_logs (user_id, topic);
