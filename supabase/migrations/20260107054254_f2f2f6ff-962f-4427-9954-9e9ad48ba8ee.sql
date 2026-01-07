-- Create comments table for user reviews and ratings
CREATE TABLE public.creation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creation_id UUID NOT NULL REFERENCES public.creations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creation_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on public creations
CREATE POLICY "Anyone can view comments on public creations"
ON public.creation_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.creations 
    WHERE id = creation_id AND is_public = true
  )
);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.creation_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.creation_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.creation_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_creation_comments_updated_at
BEFORE UPDATE ON public.creation_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_creation_comments_creation_id ON public.creation_comments(creation_id);
CREATE INDEX idx_creation_comments_user_id ON public.creation_comments(user_id);