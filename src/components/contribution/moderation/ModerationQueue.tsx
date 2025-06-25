import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import { Contribution, ContributionStatus } from '@/lib/types/contribution';
import { useAuth } from '@/contexts/AuthContext';
import { emailServiceClient } from '@/lib/services/emailServiceClient';
import { handleApiError } from '@/lib/utils/errorHandler';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ModerationQueue = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContributionStatus>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  
  // State for rejection dialog
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [contributionToReject, setContributionToReject] = useState<Contribution | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    fetchContributions(activeTab);
  }, [isAdmin, activeTab, navigate]);

  const fetchContributions = async (status: ContributionStatus) => {
    setIsLoading(true);
    try {
      let data;
      if (status === 'pending') {
        data = await contributionsApi.getModerationQueue();
      } else {
        data = await contributionsApi.getContributionsByStatus(status);
      }
      setContributions(data as Contribution[]);
    } catch (error) {
      handleApiError(error, 'Failed to load contributions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (contribution: Contribution) => {
    setProcessing(contribution.id);
    try {
      await contributionsApi.updateContributionStatus(contribution.id, 'approved');
      
      // Send email notification to contributor
      if (contribution.contributor_email) {
        await emailServiceClient.sendApprovalNotification(
          contribution.contributor_email,
          contribution.title
        );
      }
      
      toast.success('Contribution approved');
      fetchContributions(activeTab);
    } catch (error) {
      handleApiError(error, 'Failed to approve contribution');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectionDialog = (contribution: Contribution) => {
    setContributionToReject(contribution);
    setRejectionReason('');
    setRejectionDialogOpen(true);
  };

  const handleReject = async () => {
    if (!contributionToReject) return;
    
    setProcessing(contributionToReject.id);
    setRejectionDialogOpen(false);
    
    try {
      await contributionsApi.updateContributionStatus(
        contributionToReject.id, 
        'rejected',
        rejectionReason
      );
      
      // Send email notification to contributor with rejection reason
      if (contributionToReject.contributor_email) {
        await emailServiceClient.sendRejectionNotification(
          contributionToReject.contributor_email,
          contributionToReject.title,
          rejectionReason
        );
      }
      
      toast.success('Contribution rejected');
      fetchContributions(activeTab);
    } catch (error) {
      handleApiError(error, 'Failed to reject contribution');
    } finally {
      setProcessing(null);
      setContributionToReject(null);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContributorTypeLabel = (type: string) => {
    switch (type) {
      case 'member': return 'PGV Member';
      case 'guest': return 'Non-Member Guest';
      case 'mentor': return 'Mentor';
      case 'creator': return 'Content Creator';
      default: return type;
    }
  };

  const getContributionTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Submission Moderation Queue</h1>
          <p className="text-xl text-muted-foreground">
            Review and moderate community contributions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContributionStatus)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pgv-green"></div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No pending contributions to review</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {contributions.map((contribution: Contribution) => (
                  <Card key={contribution.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{contribution.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Submitted by: {getContributorTypeLabel(contribution.contributor_type)}
                            {contribution.contributor_type === 'mentor' && (
                              <Badge className="ml-2 bg-blue-500">Auto-Approve Eligible</Badge>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{getContributionTypeLabel(contribution.contribution_type)}</Badge>
                          <Badge variant="secondary">{formatDate(contribution.created_at)}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <h4 className="text-sm font-medium mb-1">Description:</h4>
                        <p className="whitespace-pre-line">{contribution.description}</p>
                        
                        {contribution.video_url && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Video URL:</h4>
                            <a 
                              href={contribution.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {contribution.video_url}
                            </a>
                          </div>
                        )}
                        
                        {contribution.key_points && contribution.key_points.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Key Points:</h4>
                            <ul className="list-disc pl-5">
                              {contribution.key_points.map((point: string, index: number) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {contribution.pros && contribution.pros.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Pros:</h4>
                            <ul className="list-disc pl-5">
                              {contribution.pros.map((pro: string, index: number) => (
                                <li key={index}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {contribution.cons && contribution.cons.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Cons:</h4>
                            <ul className="list-disc pl-5">
                              {contribution.cons.map((con: string, index: number) => (
                                <li key={index}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => openRejectionDialog(contribution)}
                        disabled={processing === contribution.id}
                      >
                        {processing === contribution.id ? 'Processing...' : 'Reject'}
                      </Button>
                      <Button 
                        onClick={() => handleApprove(contribution)}
                        disabled={processing === contribution.id}
                      >
                        {processing === contribution.id ? 'Processing...' : 'Approve'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pgv-green"></div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No approved contributions yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {contributions.map((contribution: Contribution) => (
                  <Card key={contribution.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{contribution.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Submitted by: {getContributorTypeLabel(contribution.contributor_type)}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{getContributionTypeLabel(contribution.contribution_type)}</Badge>
                          <Badge variant="secondary">{formatDate(contribution.created_at)}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line">{contribution.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pgv-green"></div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No rejected contributions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {contributions.map((contribution: Contribution) => (
                  <Card key={contribution.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{contribution.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Submitted by: {getContributorTypeLabel(contribution.contributor_type)}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{getContributionTypeLabel(contribution.contribution_type)}</Badge>
                          <Badge variant="secondary">{formatDate(contribution.created_at)}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line">{contribution.description}</p>
                        
                        {contribution.rejection_reason && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <h4 className="text-sm font-medium mb-1 text-red-700">Rejection Reason:</h4>
                            <p className="text-red-600">{contribution.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contribution</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this contribution. This will be sent to the contributor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please explain why this contribution was rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReject}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModerationQueue;