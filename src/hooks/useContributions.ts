import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionsApi } from '@/lib/api/contributions';
import { Contribution, ContributorType } from '@/lib/types/contribution';
import { useToast } from '@/components/ui/use-toast';

export const useContributions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get moderation queue
  const moderationQueue = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => contributionsApi.getModerationQueue(),
  });

  // Submit contribution
  const submitContribution = useMutation({
    mutationFn: (contribution: Omit<Contribution, 'id' | 'createdAt' | 'updatedAt'>) => 
      contributionsApi.createContribution(contribution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast({
        title: 'Contribution submitted',
        description: 'Your contribution has been submitted for review.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit contribution. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update contribution status
  const updateContributionStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'rejected' }) =>
      contributionsApi.updateContributionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast({
        title: 'Status updated',
        description: 'The contribution status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete contribution
  const deleteContribution = useMutation({
    mutationFn: (id: string) => contributionsApi.deleteContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast({
        title: 'Contribution deleted',
        description: 'The contribution has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete contribution. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Auto-approve mentor contributions
  const autoApproveMentorContributions = useMutation({
    mutationFn: () => contributionsApi.autoApproveMentorContributions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast({
        title: 'Contributions approved',
        description: 'Mentor contributions have been auto-approved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to auto-approve contributions. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    isSubmitting,
    moderationQueue,
    submitContribution,
    updateContributionStatus,
    deleteContribution,
    autoApproveMentorContributions,
  };
};

// Custom hook for user contributions
export const useUserContributions = (userId: string) => {
  return useQuery({
    queryKey: ['user-contributions', userId],
    queryFn: () => contributionsApi.getUserContributions(userId),
  });
};

// Custom hook for contributions by type
export const useContributionsByType = (type: ContributorType) => {
  return useQuery({
    queryKey: ['contributions', type],
    queryFn: () => contributionsApi.getContributionsByType(type),
  });
}; 