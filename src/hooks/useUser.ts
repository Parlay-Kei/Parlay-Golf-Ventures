import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { usersApi } from '@/lib/api/users';
import { Profile, UserRole, VerificationRequest } from '@/lib/types/user';

export const useUser = (userId?: string) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUserProfile(userId!),
    enabled: !!userId,
  });

  // Get verification requests (admin only)
  const { data: verificationRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['verification-requests'],
    queryFn: () => usersApi.getVerificationRequests(),
    enabled: profile?.role === 'admin',
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      usersApi.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    },
  });

  // Request verification
  const requestVerificationMutation = useMutation({
    mutationFn: (request: VerificationRequest) =>
      usersApi.requestVerification(request),
    onSuccess: () => {
      toast.success('Verification request submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit verification request');
      console.error('Error submitting verification request:', error);
    },
  });

  // Verify user
  const verifyUserMutation = useMutation({
    mutationFn: (token: string) => usersApi.verifyUser(token),
    onSuccess: () => {
      toast.success('User verified successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error('Failed to verify user');
      console.error('Error verifying user:', error);
    },
  });

  // Approve verification request
  const approveVerificationMutation = useMutation({
    mutationFn: (requestId: string) =>
      usersApi.approveVerificationRequest(requestId),
    onSuccess: () => {
      toast.success('Verification request approved');
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
    },
    onError: (error) => {
      toast.error('Failed to approve verification request');
      console.error('Error approving verification request:', error);
    },
  });

  // Reject verification request
  const rejectVerificationMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      usersApi.rejectVerificationRequest(requestId, reason),
    onSuccess: () => {
      toast.success('Verification request rejected');
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
    },
    onError: (error) => {
      toast.error('Failed to reject verification request');
      console.error('Error rejecting verification request:', error);
    },
  });

  return {
    profile,
    isLoadingProfile,
    verificationRequests,
    isLoadingRequests,
    isSubmitting,
    updateRole: updateRoleMutation.mutate,
    requestVerification: requestVerificationMutation.mutate,
    verifyUser: verifyUserMutation.mutate,
    approveVerification: approveVerificationMutation.mutate,
    rejectVerification: rejectVerificationMutation.mutate,
  };
}; 