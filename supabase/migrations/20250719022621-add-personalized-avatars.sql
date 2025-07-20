-- Create personalized_avatars table to store user's custom avatar
CREATE TABLE public.personalized_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  original_photo_url TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add avatar_id to wardrobes table to link clothing items to personalized avatars
ALTER TABLE public.wardrobes ADD COLUMN avatar_id UUID REFERENCES public.personalized_avatars(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.personalized_avatars ENABLE ROW LEVEL SECURITY;

-- Create policies for personalized_avatars
CREATE POLICY "Personalized avatars are viewable by everyone" 
ON public.personalized_avatars 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own personalized avatar" 
ON public.personalized_avatars 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_personalized_avatars_user ON public.personalized_avatars(user_id);
CREATE INDEX idx_wardrobes_avatar ON public.wardrobes(avatar_id);

-- Create storage bucket for original photos
INSERT INTO storage.buckets (id, name, public) VALUES ('original-photos', 'original-photos', true);

-- Create storage policies for original photos
CREATE POLICY "Original photos are viewable by owner only" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'original-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own original photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'original-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own original photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'original-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own original photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'original-photos' AND auth.uid()::text = (storage.foldername(name))[1]); 