-- Add community_id to profiles table
ALTER TABLE public.profiles ADD COLUMN community_id UUID;

-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('school', 'city')),
  location TEXT NOT NULL,
  description TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_memberships table
CREATE TABLE public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for communities
CREATE POLICY "Communities are viewable by everyone" 
ON public.communities 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage communities" 
ON public.communities 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE username = 'admin'
));

-- Create policies for community_memberships
CREATE POLICY "Community memberships are viewable by everyone" 
ON public.community_memberships 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own community memberships" 
ON public.community_memberships 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_communities_type ON public.communities(type);
CREATE INDEX idx_communities_location ON public.communities(location);
CREATE INDEX idx_community_memberships_community ON public.community_memberships(community_id);
CREATE INDEX idx_community_memberships_user ON public.community_memberships(user_id);
CREATE INDEX idx_profiles_community ON public.profiles(community_id);

-- Create function to update community member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for member count updates
CREATE TRIGGER update_community_member_count_insert
  AFTER INSERT ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

CREATE TRIGGER update_community_member_count_delete
  AFTER DELETE ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

-- Insert some sample communities
INSERT INTO public.communities (name, type, location, description) VALUES
('Stanford University', 'school', 'Stanford, CA', 'Stanford''s fashion-forward community'),
('NYU', 'school', 'New York, NY', 'NYU''s creative fashion scene'),
('Los Angeles', 'city', 'Los Angeles, CA', 'LA''s diverse fashion culture'),
('New York City', 'city', 'New York, NY', 'NYC''s iconic fashion scene'),
('Miami', 'city', 'Miami, FL', 'Miami''s vibrant street style'),
('University of Miami', 'school', 'Miami, FL', 'UM''s tropical fashion community'); 