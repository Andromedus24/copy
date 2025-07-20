import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Clock, Star, Target } from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  participant_count: number;
  max_participants: number;
  is_active: boolean;
  is_participating: boolean;
  user_submission?: {
    id: string;
    image_url: string;
    likes_count: number;
  };
}

const CompetitionsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      
      // Fetch active competitions
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Check if user is participating in each competition
      const competitionsWithParticipation = await Promise.all(
        data.map(async (comp) => {
          let isParticipating = false;
          let userSubmission = null;

          if (user) {
            const { data: submissionData } = await supabase
              .from('competition_submissions')
              .select(`
                id,
                image_url,
                likes_count
              `)
              .eq('competition_id', comp.id)
              .eq('user_id', user.id)
              .single();

            isParticipating = !!submissionData;
            userSubmission = submissionData;
          }

          return {
            ...comp,
            is_participating: isParticipating,
            user_submission: userSubmission
          };
        })
      );

      setCompetitions(competitionsWithParticipation);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load competitions",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinCompetition = async (competitionId: string) => {
    if (!user) return;

    try {
      // For now, just mark as participating
      // In a real implementation, you'd redirect to upload flow
      setCompetitions(prev => prev.map(comp => 
        comp.id === competitionId 
          ? { ...comp, is_participating: true }
          : comp
      ));

      toast({
        title: "Joined Competition!",
        description: "Upload your fit to participate in the challenge.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join competition",
      });
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-4">
          Weekly <span className="text-primary">Challenges</span>
        </h2>
        <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto">
          Compete with creators worldwide. Win coins, earn badges, and build your fashion empire.
        </p>
      </div>

      <div className="grid gap-6">
        {competitions.map((competition) => (
          <Card key={competition.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-xl">{competition.title}</CardTitle>
                    <Badge variant={competition.is_active ? "default" : "secondary"}>
                      <span>{competition.is_active ? "Active" : "Ended"}</span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{competition.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{competition.theme}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{competition.participant_count}/{competition.max_participants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{competition.prize_pool} coins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(competition.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Participation</span>
                  <span>{Math.round((competition.participant_count / competition.max_participants) * 100)}%</span>
                </div>
                <Progress 
                  value={(competition.participant_count / competition.max_participants) * 100} 
                  className="h-2"
                />
              </div>

              {/* User Submission Preview */}
              {competition.user_submission && (
                <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={competition.user_submission.image_url}
                      alt="Your submission"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Your Submission</div>
                      <div className="text-sm text-muted-foreground">
                        {competition.user_submission.likes_count} likes
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                {competition.is_participating ? (
                  <Button variant="outline" disabled>
                    Already Participating
                  </Button>
                ) : (
                  <Button 
                    onClick={() => joinCompetition(competition.id)}
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    Join Challenge
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {competitions.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <div className="text-lg text-muted-foreground mb-4">
            No active competitions right now
          </div>
          <p className="text-sm text-muted-foreground">
            Check back soon for new challenges!
          </p>
        </div>
      )}
    </div>
  );
};

export default CompetitionsSection; 