import { createClient } from '@supabase/supabase-js';
import { Profile, UserRole, VerificationRequest, VerificationResponse } from '@/lib/types/user';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const usersApi = {
  // Get user profile
  async getUserProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user role
  async updateUserRole(userId: string, role: UserRole) {
    const { data, error } = await supabase
      .from('auth.users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Request verification
  async requestVerification(request: VerificationRequest): Promise<VerificationResponse> {
    const { data, error } = await supabase
      .from('verification_requests')
      .insert({
        email: request.email,
        role: request.role,
        full_name: request.fullName,
        additional_info: request.additionalInfo,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Store verification token
    await supabase
      .from('auth.users')
      .update({
        verification_token: verificationToken,
        verification_token_expires_at: expiresAt
      })
      .eq('email', request.email);

    return {
      success: true,
      message: 'Verification request submitted. Please check your email for verification instructions.',
      verificationToken
    };
  },

  // Verify user
  async verifyUser(token: string): Promise<VerificationResponse> {
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: 'Invalid or expired verification token.'
      };
    }

    if (new Date(user.verification_token_expires_at) < new Date()) {
      return {
        success: false,
        message: 'Verification token has expired.'
      };
    }

    // Update user verification status
    const { error: updateError } = await supabase
      .from('auth.users')
      .update({
        is_verified: true,
        verification_token: null,
        verification_token_expires_at: null
      })
      .eq('id', user.id);

    if (updateError) {
      return {
        success: false,
        message: 'Failed to verify user.'
      };
    }

    return {
      success: true,
      message: 'User verified successfully.'
    };
  },

  // Get verification requests (admin only)
  async getVerificationRequests() {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Approve verification request (admin only)
  async approveVerificationRequest(requestId: string) {
    const { data: request, error: requestError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    const { error: updateError } = await supabase
      .from('auth.users')
      .update({
        role: request.role,
        is_verified: true
      })
      .eq('email', request.email);

    if (updateError) throw updateError;

    // Update verification request status
    await supabase
      .from('verification_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    return { success: true };
  },

  // Reject verification request (admin only)
  async rejectVerificationRequest(requestId: string, reason: string) {
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', requestId);

    if (error) throw error;
    return { success: true };
  }
}; 