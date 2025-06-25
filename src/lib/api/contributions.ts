import { createClient } from '@supabase/supabase-js';
import { Contribution, ContributorType, ContributionStatus } from '@/lib/types/contribution';
import { supabase } from '@/lib/supabase';
import { handleApiError, withErrorHandling } from '@/lib/utils/errorHandler';
import { checkRateLimit, formatTimeRemaining, RateLimiter, DEFAULT_RATE_LIMITS } from '@/lib/utils/rateLimiter';
import { emailServiceClient } from '@/lib/services/emailServiceClient';

export const contributionsApi = {
  // Create a new contribution
  async createContribution(contribution: Partial<Contribution>) {
    try {
      // Apply rate limiting based on contributor type
      const contributorType = contribution.contributorType || 'guest';
      const limited = checkRateLimit(contributorType);
      
      if (limited) {
        throw new Error(`Rate limit exceeded. Please try again later.`);
      }

      const { data, error } = await supabase
        .from('contributions')
        .insert(contribution) // Insert the contribution object directly
        .select()
        .single();

      if (error) throw error;
      
      // Send notification to moderators about the new submission
      try {
        // In a real implementation, we would fetch admin emails from the database
        // For now, we'll use a placeholder moderator email for demonstration
        const moderatorEmails = ['admin@parlaygolfventures.com'];
        
        await emailServiceClient.sendNewSubmissionNotification(
          moderatorEmails,
          contribution.title || 'Untitled Contribution',
          contributorType
        );
      } catch (emailError) {
        // Log the error but don't fail the contribution creation
        console.error('Failed to send moderator notification:', emailError);
      }
      
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to create contribution');
      throw error;
    }
  },

  // Get a single contribution by ID
  async getContribution(id: string) {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }, 'Failed to retrieve contribution');
  },

  // Get contributions by contributor type
  async getContributionsByType(type: ContributorType) {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('contributor_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }, `Failed to retrieve ${type} contributions`);
  },

  // Get contributions by status
  async getContributionsByStatus(status: 'pending' | 'approved' | 'rejected') {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }, `Failed to retrieve ${status} contributions`);
  },

  /**
   * Update contribution status
   */
  async updateContributionStatus(id: string, status: ContributionStatus, rejectionReason?: string) {
    try {
      const updateData: Partial<Contribution> = { status };
      
      // If rejecting with a reason, store the reason
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      const { data, error } = await supabase
        .from('contributions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleApiError(error, `Failed to update contribution status to ${status}`);
      throw error;
    }
  },

  // Get pending swings for mentor review
  async getPendingSwingsForReview() {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('status', 'pending')
        .eq('contributor_type', 'member')
        .in('contribution_type', ['swing-video', 'swing-demo'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }, 'Failed to retrieve pending swings for review');
  },

  // Get user's contributions
  async getUserContributions(userId: string) {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('contributor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }, 'Failed to retrieve your contributions');
  },

  // Delete a contribution
  async deleteContribution(id: string) {
    return withErrorHandling(async () => {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    }, 'Failed to delete contribution');
  },

  // Get contributions that need moderation
  async getModerationQueue() {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }, 'Failed to retrieve moderation queue');
  },

  // Auto-approve mentor contributions
  async autoApproveMentorContributions() {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('contributions')
        .update({ status: 'approved' })
        .eq('contributor_type', 'mentor')
        .eq('status', 'pending')
        .select();

      if (error) throw error;
      return data;
    }, 'Failed to auto-approve mentor contributions');
  },

  // Get rate limit status for a user
  getRateLimitStatus(contributorType: ContributorType) {
    const limits = DEFAULT_RATE_LIMITS[contributorType] || DEFAULT_RATE_LIMITS.guest;
    
    const rateLimiter = new RateLimiter({
      maxRequests: limits.maxRequests,
      windowMs: limits.windowMs,
      identifier: `contribution:${contributorType}`
    });
    
    const { limited, resetTime } = rateLimiter.check();
    
    return {
      limited,
      maxRequests: limits.maxRequests,
      windowMs: limits.windowMs,
      resetTime,
      timeRemaining: formatTimeRemaining(Math.max(0, resetTime - Date.now()))
    };
  }
};