import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const emailVerificationApi = {
  async sendVerificationEmail() {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.email) throw new Error('No user email found');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast.success('Verification email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email');
      return { success: false, error };
    }
  },

  async verifyEmail(token: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) throw error;

      toast.success('Email verified successfully');
      return { success: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Failed to verify email');
      return { success: false, error };
    }
  },

  async checkVerificationStatus() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      return {
        success: true,
        isVerified: user?.email_confirmed_at !== null,
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { success: false, error };
    }
  },
}; 