/**
 * Beta Service
 * 
 * This service manages beta access to the Parlay Golf Ventures platform,
 * including invite code generation, validation, and user management.
 */

import { supabase } from '@/lib/supabase';
import { handleApiError } from '@/lib/utils/errorHandler';
import { emailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Beta invite status types
 */
export type InviteStatus = 'pending' | 'sent' | 'claimed' | 'expired';

/**
 * Beta invite interface
 */
export interface BetaInvite {
  id: string;
  code: string;
  email: string;
  status: InviteStatus;
  created_at: Date;
  sent_at?: Date;
  claimed_at?: Date;
  expires_at?: Date;
  created_by?: string;
  notes?: string;
}

/**
 * Service for managing beta access
 */
export const betaService = {
  /**
   * Check if beta mode is enabled
   */
  isBetaMode(): boolean {
    return import.meta.env.VITE_BETA_MODE === 'true';
  },

  /**
   * Toggle beta mode
   * @param enabled Whether beta mode should be enabled
   * @returns Promise that resolves when the setting is updated
   */
  async toggleBetaMode(enabled: boolean): Promise<boolean> {
    try {
      // In a production environment, this would update an environment variable or database setting
      // For now, we'll use localStorage to simulate the change
      localStorage.setItem('BETA_MODE_OVERRIDE', enabled ? 'true' : 'false');
      
      // Log the beta mode change
      console.log(`Beta mode ${enabled ? 'enabled' : 'disabled'} by admin`);
      
      // Log the status change to the database
      await this.logPlatformStatusChange(enabled ? 'beta' : 'live');
      
      return true;
    } catch (error) {
      console.error('Error toggling beta mode:', error);
      return false;
    }
  },

  /**
   * Log platform status change to the database
   * @param status The new platform status ('beta' or 'live')
   * @param notes Optional notes about the status change
   */
  async logPlatformStatusChange(status: 'beta' | 'live', notes?: string): Promise<void> {
    try {
      // Get the current user ID if available
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Call the database function to log the status change
      const { data, error } = await supabase
        .rpc('log_platform_status_change', {
          new_status: status,
          admin_id: userId || null,
          change_notes: notes || `Platform switched to ${status} mode`
        });
      
      if (error) throw error;
      
      console.log(`Platform status change logged: ${status}`);
    } catch (error) {
      handleApiError(error, 'Failed to log platform status change');
    }
  },

  /**
   * Get the current beta mode status, respecting admin overrides
   */
  getCurrentBetaStatus(): boolean {
    // Check for admin override first
    const override = localStorage.getItem('BETA_MODE_OVERRIDE');
    if (override !== null) {
      return override === 'true';
    }
    
    // Fall back to environment variable
    return this.isBetaMode();
  },

  /**
   * Log a new user signup
   * @param userId The ID of the new user
   * @param email The email of the new user
   * @param isBetaMode Whether the signup occurred during beta mode
   */
  async logSignup(userId: string, email: string, isBetaMode: boolean): Promise<void> {
    try {
      // Log to Supabase
      const { error } = await supabase
        .from('user_signups')
        .insert({
          user_id: userId,
          email,
          is_beta: isBetaMode,
          signup_date: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Log to console for debugging
      console.log(`New user signup: ${email} (${userId}) - Beta mode: ${isBetaMode}`);
    } catch (error) {
      handleApiError(error, 'Failed to log user signup');
    }
  },

  /**
   * Generate a new invite code
   * @returns A unique invite code
   */
  generateInviteCode(): string {
    // Generate a unique code format: XXXX-XXXX-XXXX (where X is alphanumeric)
    const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const segment3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `${segment1}-${segment2}-${segment3}`;
  },

  /**
   * Create a new beta invite
   * @param email Recipient email address
   * @param createdBy User ID of the admin creating the invite
   * @param notes Optional notes about the invite
   * @returns The created invite
   */
  async createInvite(email: string, createdBy?: string, notes?: string): Promise<BetaInvite> {
    try {
      const code = this.generateInviteCode();
      const now = new Date();
      
      // Set expiration date to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const { data, error } = await supabase
        .from('beta_invites')
        .insert({
          code,
          email,
          status: 'pending',
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          created_by: createdBy,
          notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as BetaInvite;
    } catch (error) {
      handleApiError(error, 'Failed to create beta invite');
      throw error;
    }
  },

  /**
   * Send a beta invite email
   * @param inviteId The ID of the invite to send
   * @returns True if the email was sent successfully
   */
  async sendInvite(inviteId: string): Promise<boolean> {
    try {
      // Get the invite details
      const { data: invite, error } = await supabase
        .from('beta_invites')
        .select('*')
        .eq('id', inviteId)
        .single();
      
      if (error) throw error;
      if (!invite) throw new Error('Invite not found');
      
      // Send the invitation email
      const emailSent = await emailService.sendBetaInvitation(invite.email, invite.code);
      
      if (emailSent) {
        // Update the invite status to 'sent'
        const now = new Date();
        const { error: updateError } = await supabase
          .from('beta_invites')
          .update({
            status: 'sent',
            sent_at: now.toISOString()
          })
          .eq('id', inviteId);
        
        if (updateError) throw updateError;
        return true;
      }
      
      return false;
    } catch (error) {
      handleApiError(error, 'Failed to send beta invite');
      return false;
    }
  },

  /**
   * Validate an invite code
   * @param code The invite code to validate
   * @returns True if the code is valid
   */
  async validateInviteCode(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('beta_invites')
        .select('*')
        .eq('code', code)
        .eq('status', 'sent')
        .single();
      
      if (error) return false;
      if (!data) return false;
      
      // Check if the invite has expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        // Update the invite status to 'expired'
        await supabase
          .from('beta_invites')
          .update({ status: 'expired' })
          .eq('id', data.id);
        
        return false;
      }
      
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to validate invite code', false);
      return false;
    }
  },

  /**
   * Claim an invite code (mark as used)
   * @param code The invite code to claim
   * @param userId The user ID claiming the code
   * @returns True if the code was claimed successfully
   */
  async claimInviteCode(code: string, userId: string): Promise<boolean> {
    try {
      // First validate the code
      const isValid = await this.validateInviteCode(code);
      if (!isValid) return false;
      
      // Get the invite details
      const { data: invite, error } = await supabase
        .from('beta_invites')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error) throw error;
      if (!invite) return false;
      
      // Update the invite status to 'claimed'
      const now = new Date();
      const { error: updateError } = await supabase
        .from('beta_invites')
        .update({
          status: 'claimed',
          claimed_at: now.toISOString(),
          claimed_by: userId
        })
        .eq('id', invite.id);
      
      if (updateError) throw updateError;
      
      // Add the user to the beta_users table
      const { error: betaUserError } = await supabase
        .from('beta_users')
        .insert({
          user_id: userId,
          invite_id: invite.id,
          joined_at: now.toISOString()
        });
      
      if (betaUserError) throw betaUserError;
      
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to claim invite code');
      return false;
    }
  },

  /**
   * Check if a user has beta access
   * @param userId The user ID to check
   * @returns True if the user has beta access
   */
  async hasBetaAccess(userId: string): Promise<boolean> {
    try {
      // If beta mode is disabled, everyone has access
      if (!this.isBetaMode()) return true;
      
      const { data, error } = await supabase
        .from('beta_users')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) return false;
      return !!data;
    } catch (error) {
      handleApiError(error, 'Failed to check beta access', false);
      return false;
    }
  },

  /**
   * Get all beta invites
   * @returns List of all beta invites
   */
  async getAllInvites(): Promise<BetaInvite[]> {
    try {
      const { data, error } = await supabase
        .from('beta_invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BetaInvite[];
    } catch (error) {
      handleApiError(error, 'Failed to get beta invites');
      throw error;
    }
  },

  /**
   * Get all beta users
   * @returns List of all beta users
   */
  async getBetaUsers(): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('beta_users')
        .select(`
          *,
          users:user_id (id, email, user_metadata),
          invites:invite_id (*)
        `)
        .order('joined_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to get beta users');
      throw error;
    }
  },

  /**
   * Bulk create and send invites
   * @param emails Array of email addresses to invite
   * @param createdBy User ID of the admin creating the invites
   * @returns Number of successfully sent invites
   */
  async bulkInvite(emails: string[], createdBy?: string): Promise<number> {
    try {
      let successCount = 0;
      
      for (const email of emails) {
        try {
          // Create the invite
          const invite = await this.createInvite(email, createdBy);
          
          // Send the invite email
          const sent = await this.sendInvite(invite.id);
          if (sent) successCount++;
        } catch (error) {
          console.error(`Failed to invite ${email}:`, error);
          // Continue with the next email
        }
      }
      
      return successCount;
    } catch (error) {
      handleApiError(error, 'Failed to bulk invite users');
      return 0;
    }
  }
};
