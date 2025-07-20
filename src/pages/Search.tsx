import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  follower_count: number;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim()) {
      searchProfiles();
    } else {
      loadRecentProfiles();
    }
  }, [searchTerm]);

  const searchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;

      // Get follower counts for each profile
      const profilesWithCounts = await Promise.all(
        data.map(async (profile) => {
          const { count } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.user_id);

          return {
            ...profile,
            follower_count: count || 0
          };
        })
      );

      setProfiles(profilesWithCounts);
    } catch (error) {
      console.error('Error searching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get follower counts for each profile
      const profilesWithCounts = await Promise.all(
        data.map(async (profile) => {
          const { count } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.user_id);

          return {
            ...profile,
            follower_count: count || 0
          };
        })
      );

      setProfiles(profilesWithCounts);
    } catch (error) {
      console.error('Error loading profiles:', error);
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
              Discover People
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Search Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Searching...
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No profiles found' : 'No profiles available'}
            </div>
          ) : (
            profiles.map((profile) => (
              <Card 
                key={profile.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => navigate(`/profile/${profile.username}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        {profile.display_name?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{profile.display_name || profile.username}</h3>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      {profile.bio && (
                        <p className="text-sm mt-1 line-clamp-2">{profile.bio}</p>
                      )}
                      <Badge variant="secondary" className="mt-2">
                        {profile.follower_count} Followers
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;