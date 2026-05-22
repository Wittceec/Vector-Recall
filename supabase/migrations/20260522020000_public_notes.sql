-- Add is_public column to notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Add RLS policy for public access to notes
CREATE POLICY "Public notes are viewable by everyone" ON public.notes
  FOR SELECT USING (is_public = true);
