import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Share, MoreHorizontal, Sparkles } from 'lucide-react';

interface FeedPost {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  profile: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface FeedSectionProps {
  mode?: 'for-you' | 'following';
}

const FeedSection = ({ mode = 'for-you' }: FeedSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>(mode);

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('wardrobes')
        .select(`
          *,
          profile:profiles!wardrobes_user_id_fkey(
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // If following tab, filter to only show posts from followed users
      if (activeTab === 'following' && user) {
        const { data: followingIds } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        if (followingIds && followingIds.length > 0) {
          const ids = followingIds.map(f => f.following_id);
          query = query.in('user_id', ids);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get like counts and check if current user liked each post
      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          let isLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            isLiked = !!likeData;
          }

          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            is_liked: isLiked
          };
        })
      );

      setPosts(postsWithLikes);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load posts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update like",
      });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const shareUrl = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${post.profile.display_name}'s fit on Fitzty`,
          text: post.description || 'Check out this amazing fit!',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share post",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Loading fits...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === 'for-you' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('for-you')}
            className="rounded-md"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            For You
          </Button>
          <Button
            variant={activeTab === 'following' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('following')}
            className="rounded-md"
          >
            Following
          </Button>
        </div>
      </div>

      {/* Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.profile.avatar_url} />
                  <AvatarFallback>
                    {post.profile.display_name?.charAt(0)?.toUpperCase() || 
                     post.profile.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {post.profile.display_name || post.profile.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Post Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.description || 'Fashion post'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 ${post.is_liked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes_count}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-2 ml-auto"
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Post Description */}
                {post.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">
                      {post.profile.display_name || post.profile.username}
                    </span>{' '}
                    {post.description}
                  </p>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <span>#fitzty</span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <span>#fashion</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-lg text-muted-foreground mb-4">
            {activeTab === 'following' 
              ? "Follow some creators to see their fits here!"
              : "No fits yet. Be the first to post!"
            }
          </div>
          <Button variant="outline">
            {activeTab === 'following' ? 'Discover Creators' : 'Upload Your First Fit'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedSection; 