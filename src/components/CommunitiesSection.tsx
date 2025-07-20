import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Users, TrendingUp, GraduationCap, Building, Plus, Search } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  type: 'school' | 'city';
  location: string;
  member_count: number;
  description: string;
  is_joined: boolean;
  top_creators: Array<{
    username: string;
    display_name: string;
    avatar_url: string;
    follower_count: number;
  }>;
}

const CommunitiesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      
      // Fetch all communities
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;

      // Check which communities user has joined
      const communitiesWithJoinStatus = await Promise.all(
        data.map(async (community) => {
          let isJoined = false;
          if (user) {
            const { data: membershipData } = await supabase
              .from('community_memberships')
              .select('id')
              .eq('community_id', community.id)
              .eq('user_id', user.id)
              .single();
            isJoined = !!membershipData;
          }

          // Get top creators for this community
          const { data: topCreators } = await supabase
            .from('profiles')
            .select(`
              username,
              display_name,
              avatar_url,
              follower_count
            `)
            .eq('community_id', community.id)
            .order('follower_count', { ascending: false })
            .limit(3);

          return {
            ...community,
            is_joined: isJoined,
            top_creators: topCreators || []
          };
        })
      );

      setCommunities(communitiesWithJoinStatus);
      setUserCommunities(communitiesWithJoinStatus.filter(c => c.is_joined));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load communities",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: user.id
        });

      // Update local state
      setCommunities(prev => prev.map(comm => 
        comm.id === communityId 
          ? { ...comm, is_joined: true, member_count: comm.member_count + 1 }
          : comm
      ));

      setUserCommunities(prev => {
        const community = communities.find(c => c.id === communityId);
        return community ? [...prev, { ...community, is_joined: true }] : prev;
      });

      toast({
        title: "Joined Community!",
        description: "You're now part of this fashion community.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join community",
      });
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      // Update local state
      setCommunities(prev => prev.map(comm => 
        comm.id === communityId 
          ? { ...comm, is_joined: false, member_count: comm.member_count - 1 }
          : comm
      ));

      setUserCommunities(prev => prev.filter(comm => comm.id !== communityId));

      toast({
        title: "Left Community",
        description: "You've left this community.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to leave community",
      });
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-4">
          Fashion <span className="text-primary">Communities</span>
        </h2>
        <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto">
          Join your school or city's fashion scene. Connect with local creators and discover trending styles in your area.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* User's Communities */}
      {userCommunities.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-medium mb-6">Your Communities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCommunities.map((community) => (
              <Card key={community.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {community.type === 'school' ? (
                          <GraduationCap className="h-4 w-4 text-primary" />
                        ) : (
                          <Building className="h-4 w-4 text-primary" />
                        )}
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          <span>{community.type}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{community.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{community.member_count} members</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {community.description}
                  </p>
                  
                  {/* Top Creators */}
                  {community.top_creators.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Top Creators
                      </div>
                      <div className="flex -space-x-2">
                        {community.top_creators.map((creator, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                            title={creator.display_name || creator.username}
                          >
                            {(creator.display_name || creator.username).charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => leaveCommunity(community.id)}
                    className="w-full"
                  >
                    Leave Community
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Communities */}
      <div>
        <h3 className="text-xl font-medium mb-6">
          Discover Communities
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities
            .filter(community => !community.is_joined)
            .map((community) => (
            <Card key={community.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {community.type === 'school' ? (
                        <GraduationCap className="h-4 w-4 text-primary" />
                      ) : (
                        <Building className="h-4 w-4 text-primary" />
                      )}
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {community.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{community.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{community.member_count} members</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {community.description}
                </p>
                
                <Button
                  onClick={() => joinCommunity(community.id)}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Join Community
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredCommunities.filter(c => !c.is_joined).length === 0 && (
        <div className="text-center py-20">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <div className="text-lg text-muted-foreground mb-4">
            No communities found
          </div>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or check back later for new communities.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunitiesSection; 