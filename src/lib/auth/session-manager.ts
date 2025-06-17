import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const sessionManager = {
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;
      return { success: true, session };
    } catch (error) {
      console.error('Error getting current session:', error);
      return { success: false, error };
    }
  },

  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error) throw error;
      return { success: true, session };
    } catch (error) {
      console.error('Error refreshing session:', error);
      return { success: false, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success('Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
      return { success: false, error };
    }
  },

  async updateSession(data: Record<string, unknown>) {
    try {
      const { error } = await supabase.auth.updateUser({
        data,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating session:', error);
      return { success: false, error };
    }
  },

  async setSessionCookie(accessToken: string, refreshToken: string) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error setting session cookie:', error);
      return { success: false, error };
    }
  },
}; 