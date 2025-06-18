import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Users, ArrowRight, Trophy, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  username?: string;
  avatar_url?: string;
  crew_id?: string;
  onboarding_completed?: boolean;
}

interface Crew {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

const CREW_DATA: Record<string, Crew> = {
  beginners: { id: 'beginners', name: 'Beginner Crew', description: 'Perfect for new golfers starting their journey', memberCount: 45 },
  intermediate: { id: 'intermediate', name: 'Intermediate Crew', description: 'For golfers looking to improve their game', memberCount: 32 },
  advanced: { id: 'advanced', name: 'Advanced Crew', description: 'For experienced golfers pushing their limits', memberCount: 28 },
  competitive: { id: 'competitive', name: 'Competitive Crew', description: 'For tournament players and serious competitors', memberCount: 19 },
};

export function SimplifiedDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCrew, setUserCrew] = useState<Crew | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        if (data.crew_id && CREW_DATA[data.crew_id]) {
          setUserCrew(CREW_DATA[data.crew_id]);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSwing = () => {
    navigate('/upload');
  };

  const handleExploreCrew = () => {
    navigate('/community');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pgv-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
              <AvatarFallback className="text-xl">
                {profile?.username?.charAt(0) || user?.email?.charAt(0) || <User />}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h1 className="text-2xl font-bold">Welcome, {profile?.username || user?.email?.split('@')[0] || 'Golfer'}!</h1>
              <p className="text-muted-foreground">Ready to improve your game?</p>
            </div>
          </div>
          
          {userCrew && (
            <div className="inline-flex items-center gap-2 bg-pgv-green/10 text-pgv-green px-3 py-1 rounded-full">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{userCrew.name}</span>
            </div>
          )}
        </div>

        {/* Primary Actions - Only 2 as per Hick's Law */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload Your First Swing */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleUploadSwing}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                Upload Your First Swing
              </CardTitle>
              <CardDescription>
                Get personalized feedback on your swing technique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span>AI-powered analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Mentor feedback available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Share with your crew</span>
                </div>
              </div>
              
              <Button className="w-full mt-4" size="lg">
                Start Upload
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Explore Your Crew */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExploreCrew}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                Explore Your Crew
              </CardTitle>
              <CardDescription>
                Connect with fellow golfers and share your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userCrew ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userCrew.name}</span>
                    <Badge variant="secondary">{userCrew.memberCount} members</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{userCrew.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>View recent posts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>See crew achievements</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">Join a crew to connect with other golfers</p>
                  <Badge variant="outline">No crew selected</Badge>
                </div>
              )}
              
              <Button className="w-full mt-4" size="lg" variant="outline">
                View Crew
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-pgv-green">0</div>
              <div className="text-sm text-muted-foreground">Swings Uploaded</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-pgv-green">0</div>
              <div className="text-sm text-muted-foreground">Lessons Completed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-pgv-green">0</div>
              <div className="text-sm text-muted-foreground">Crew Posts</div>
            </div>
          </div>
        </div>

        {/* Beta Notice */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Welcome to PGV Beta!</h3>
                  <p className="text-sm text-blue-700">
                    You're among the first to experience our platform. Your feedback helps us improve the experience for everyone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 