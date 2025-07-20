import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          bio: profile.bio || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('wardrobes')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobes')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Success!",
        description: "Avatar updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile.display_name?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <Button variant="outline" size="sm" disabled={loading}>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Click to upload a new profile picture
                </p>
              </div>
            </div>

            {/* Username (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Your display name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;