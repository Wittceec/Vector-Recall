-- Add folder_path column to notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS folder_path text DEFAULT '';
