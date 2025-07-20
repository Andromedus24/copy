-- Create competitions table
CREATE TABLE public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competition_submissions table
CREATE TABLE public.competition_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Create user_coins table for gamification
CREATE TABLE public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table for achievements
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Enable Row Level Security
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for competitions
CREATE POLICY "Competitions are viewable by everyone" 
ON public.competitions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage competitions" 
ON public.competitions 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE username = 'admin'
));

-- Create policies for competition_submissions
CREATE POLICY "Competition submissions are viewable by everyone" 
ON public.competition_submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own competition submissions" 
ON public.competition_submissions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_coins
CREATE POLICY "Users can view their own coins" 
ON public.user_coins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" 
ON public.user_coins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins" 
ON public.user_coins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_badges
CREATE POLICY "User badges are viewable by everyone" 
ON public.user_badges 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own badges" 
ON public.user_badges 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_competitions_active ON public.competitions(is_active, start_date);
CREATE INDEX idx_competition_submissions_competition ON public.competition_submissions(competition_id);
CREATE INDEX idx_competition_submissions_user ON public.competition_submissions(user_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

-- Create function to automatically create user_coins on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_coins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_coins (user_id, coins)
  VALUES (NEW.id, 100); -- Give new users 100 coins
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create user coins
CREATE TRIGGER on_auth_user_created_coins
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_coins();

-- Create function to update competition participant count
CREATE OR REPLACE FUNCTION public.update_competition_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.competitions 
    SET participant_count = participant_count + 1
    WHERE id = NEW.competition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.competitions 
    SET participant_count = participant_count - 1
    WHERE id = OLD.competition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for participant count updates
CREATE TRIGGER update_competition_participant_count_insert
  AFTER INSERT ON public.competition_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_competition_participant_count();

CREATE TRIGGER update_competition_participant_count_delete
  AFTER DELETE ON public.competition_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_competition_participant_count(); 