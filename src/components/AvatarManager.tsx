import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, RefreshCw, Sparkles, Camera } from 'lucide-react';
import AvatarCreation from './AvatarCreation';

interface PersonalizedAvatar {
  id: string;
  avatar_url: string;
  original_photo_url: string;
  created_at: string;
}

const AvatarManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatar, setAvatar] = useState<PersonalizedAvatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarCreation, setShowAvatarCreation] = useState(false);

  useEffect(() => {
    fetchAvatar();
  }, []);

  const fetchAvatar = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personalized_avatars')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAvatar(data);
    } catch (error: any) {
      console.error('Error fetching avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarCreated = () => {
    fetchAvatar();
    setShowAvatarCreation(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-lg">Loading avatar...</div>
        </CardContent>
      </Card>
    );
  }

  if (!avatar) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personalized Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-2">Create Your Personalized Avatar</p>
                  <p className="text-muted-foreground">
                    Upload a photo of yourself to create a personalized avatar for clothing try-ons.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setShowAvatarCreation(true)}
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Create Avatar
            </Button>
          </CardContent>
        </Card>

        {showAvatarCreation && (
          <AvatarCreation
            onClose={() => setShowAvatarCreation(false)}
            onAvatarCreated={handleAvatarCreated}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Personalized Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img 
              src={avatar.avatar_url} 
              alt="Your personalized avatar" 
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
            <div className="flex-1">
              <p className="font-medium">Avatar Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(avatar.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Ready!</strong> You can now upload clothing items to see them on your personalized avatar.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowAvatarCreation(true)}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Avatar
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(avatar.avatar_url, '_blank')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              View Full Size
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAvatarCreation && (
        <AvatarCreation
          onClose={() => setShowAvatarCreation(false)}
          onAvatarCreated={handleAvatarCreated}
        />
      )}
    </>
  );
};

export default AvatarManager; 