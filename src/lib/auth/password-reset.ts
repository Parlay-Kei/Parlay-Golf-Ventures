import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const passwordResetApi = {
  async requestPasswordReset(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset instructions sent to your email');
      return { success: true };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Failed to send password reset instructions');
      return { success: false, error };
    }
  },

  async resetPassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
      return { success: false, error };
    }
  },

  async validateResetToken(token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error validating reset token:', error);
      return { success: false, error };
    }
  },
}; 