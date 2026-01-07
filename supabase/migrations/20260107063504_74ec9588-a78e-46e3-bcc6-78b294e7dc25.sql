-- Add status, version, and auto_saved_at columns to creations table
ALTER TABLE public.creations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS auto_saved_at timestamp with time zone;

-- Create creation_versions table for version history
CREATE TABLE public.creation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creation_id uuid NOT NULL REFERENCES public.creations(id) ON DELETE CASCADE,
  version integer NOT NULL,
  html_code text NOT NULL,
  change_note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(creation_id, version)
);

-- Enable RLS on creation_versions
ALTER TABLE public.creation_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions of their own creations
CREATE POLICY "Users can view own creation versions" 
ON public.creation_versions
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.creations WHERE id = creation_id AND user_id = auth.uid())
);

-- Users can create versions for their own creations
CREATE POLICY "Users can create versions for own creations" 
ON public.creation_versions
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.creations WHERE id = creation_id AND user_id = auth.uid())
);

-- Users can delete versions of their own creations
CREATE POLICY "Users can delete own creation versions" 
ON public.creation_versions
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.creations WHERE id = creation_id AND user_id = auth.uid())
);