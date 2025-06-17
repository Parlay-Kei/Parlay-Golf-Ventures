import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type SignUp = {
  id: string;
  name: string;
  email: string;
  skill_level: string;
  goals: string;
  learning_style: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function SignUpsTab() {
  const [signUps, setSignUps] = useState<SignUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignUp, setSelectedSignUp] = useState<SignUp | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSignUps();

    // Set up real-time subscription
    const subscription = supabase
      .channel('academy_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academy_users' }, (payload) => {
        fetchSignUps();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchSignUps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignUps(data || []);
    } catch (error) {
      console.error('Error fetching sign-ups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sign-ups. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSignUpStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(id);
      const { error } = await supabase
        .from('academy_users')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSignUps((prev) =>
        prev.map((signup) => (signup.id === id ? { ...signup, status } : signup))
      );

      toast({
        title: status === 'approved' ? 'Sign-up Approved' : 'Sign-up Rejected',
        description: `The user has been ${status}.`,
      });
    } catch (error) {
      console.error('Error updating sign-up status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const viewSignUpDetails = (signUp: SignUp) => {
    setSelectedSignUp(signUp);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSkillLevelText = (level: string) => {
    const levels: Record<string, string> = {
      beginner: 'Beginner (Just starting out)',
      intermediate: 'Intermediate (Regular player)',
      advanced: 'Advanced (Competitive player)',
      expert: 'Expert (Tournament player)',
    };
    return levels[level] || level;
  };

  const getLearningStyleText = (style: string) => {
    const styles: Record<string, string> = {
      visual: 'Visual (Video demonstrations)',
      practical: 'Practical (Hands-on practice)',
      analytical: 'Analytical (Detailed explanations)',
      social: 'Social (Group learning)',
      mixed: 'Mixed (Combination of styles)',
    };
    return styles[style] || style;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
        <span className="ml-2">Loading sign-ups...</span>
      </div>
    );
  }

  return (
    <div>
      {signUps.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No sign-ups found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Skill Level</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {signUps.map((signUp) => (
                <tr key={signUp.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{signUp.name}</td>
                  <td className="px-4 py-3">{signUp.email}</td>
                  <td className="px-4 py-3">{getSkillLevelText(signUp.skill_level)}</td>
                  <td className="px-4 py-3">{formatDate(signUp.created_at)}</td>
                  <td className="px-4 py-3">{getStatusBadge(signUp.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewSignUpDetails(signUp)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {signUp.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => updateSignUpStatus(signUp.id, 'approved')}
                            disabled={processingId === signUp.id}
                          >
                            {processingId === signUp.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => updateSignUpStatus(signUp.id, 'rejected')}
                            disabled={processingId === signUp.id}
                          >
                            {processingId === signUp.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sign-Up Details</DialogTitle>
            <DialogDescription>Complete information about the member</DialogDescription>
          </DialogHeader>

          {selectedSignUp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p>{selectedSignUp.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{selectedSignUp.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Skill Level</h4>
                  <p>{getSkillLevelText(selectedSignUp.skill_level)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Learning Style</h4>
                  <p>{getLearningStyleText(selectedSignUp.learning_style)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{formatDate(selectedSignUp.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{getStatusBadge(selectedSignUp.status)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Goals & Bio</h4>
                <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {selectedSignUp.goals}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>

            {selectedSignUp && selectedSignUp.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => {
                    updateSignUpStatus(selectedSignUp.id, 'approved');
                    setIsDialogOpen(false);
                  }}
                  disabled={!!processingId}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    updateSignUpStatus(selectedSignUp.id, 'rejected');
                    setIsDialogOpen(false);
                  }}
                  disabled={!!processingId}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
