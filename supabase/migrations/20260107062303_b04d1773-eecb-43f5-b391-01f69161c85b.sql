-- Create game_saves table for cloud save functionality
CREATE TABLE public.game_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creation_id UUID NOT NULL REFERENCES public.creations(id) ON DELETE CASCADE,
  save_slot INTEGER NOT NULL DEFAULT 1,
  save_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  save_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, creation_id, save_slot)
);

-- Enable RLS
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

-- Users can view their own saves
CREATE POLICY "Users can view their own saves"
ON public.game_saves
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own saves
CREATE POLICY "Users can create their own saves"
ON public.game_saves
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own saves
CREATE POLICY "Users can update their own saves"
ON public.game_saves
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own saves
CREATE POLICY "Users can delete their own saves"
ON public.game_saves
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_game_saves_updated_at
BEFORE UPDATE ON public.game_saves
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();