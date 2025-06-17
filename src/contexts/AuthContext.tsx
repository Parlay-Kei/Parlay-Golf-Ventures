import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User, AuthError, UserResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { IS_DEV_ENV, DEV_CONFIG } from '@/lib/config/env';

// Define proper interfaces for better type safety
interface AuthErrorResponse {
  error: AuthError | null;
}

interface AuthDataResponse {
  error: AuthError | null;
  data: UserResponse | null;
}

interface ProfileUpdateData {
  email?: string;
  password?: string;
  data?: {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

interface UserRole {
  role: string;
  user_id: string;
}

// Define the shape of the auth context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthErrorResponse>;
  signUp: (email: string, password: string) => Promise<AuthDataResponse>;
  signOut: () => Promise<AuthErrorResponse>;
  loading: boolean;
  resetPassword: (email: string) => Promise<AuthErrorResponse>;
  updateProfile: (data: ProfileUpdateData) => Promise<AuthDataResponse>;
  userRoles: string[];
  isAdmin: () => boolean;
  isMentor: () => boolean;
  isContentCreator: () => boolean;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => ({ error: null }),
  loading: true,
  resetPassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null, data: null }),
  userRoles: [],
  isAdmin: () => false,
  isMentor: () => false,
  isContentCreator: () => false,
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap the app and provide auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Function to fetch user roles from the database
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      // In development mode, use mock roles if configured
      if (IS_DEV_ENV && DEV_CONFIG.AUTH.MOCK_ROLES) {
        console.log('Using mock roles in development mode:', DEV_CONFIG.AUTH.DEFAULT_ROLES);
        setUserRoles(DEV_CONFIG.AUTH.DEFAULT_ROLES);
        return;
      }

      // Otherwise, fetch roles from the database
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        // Set default roles on error to prevent UI issues
        setUserRoles(['user']);
        return;
      }

      if (data && data.length > 0) {
        const roles = data.map((item: UserRole) => item.role);
        console.log('Fetched user roles:', roles);
        setUserRoles(roles);
      } else {
        console.log('No roles found for user, setting default role: user');
        setUserRoles(['user']);
      }
    } catch (error) {
      console.error('Exception fetching user roles:', error);
      // Set default roles on error to prevent UI issues
      setUserRoles(['user']);
    }
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<AuthErrorResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        return { error };
      }

      console.log('Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('Exception during sign in:', error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<AuthDataResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error signing up:', error);
        return { error, data: null };
      }

      console.log('Sign up successful');
      return { error: null, data };
    } catch (error) {
      console.error('Exception during sign up:', error);
      return { error: error as AuthError, data: null };
    }
  };

  // Sign out
  const signOut = async (): Promise<AuthErrorResponse> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        return { error };
      }

      console.log('Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Exception during sign out:', error);
      return { error: error as AuthError };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<AuthErrorResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('Error resetting password:', error);
        return { error };
      }

      console.log('Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('Exception during password reset:', error);
      return { error: error as AuthError };
    }
  };

  // Update user profile
  const updateProfile = async (data: ProfileUpdateData): Promise<AuthDataResponse> => {
    try {
      const { error } = await supabase.auth.updateUser(data);

      if (error) {
        console.error('Error updating profile:', error);
        return { error, data: null };
      }

      console.log('Profile updated successfully');
      return { error: null, data: null };
    } catch (error) {
      console.error('Exception during profile update:', error);
      return { error: error as AuthError, data: null };
    }
  };

  // Role check helper functions
  const isAdmin = () => userRoles.includes('admin');
  const isMentor = () => userRoles.includes('mentor');
  const isContentCreator = () => userRoles.includes('content_creator');

  // Effect to handle auth state changes
  useEffect(() => {
    // Function to handle auth state changes
    const handleAuthChange = async () => {
      try {
        // In development mode, bypass auth if configured
        if (IS_DEV_ENV && DEV_CONFIG.AUTH.BYPASS_AUTH) {
          console.log('Bypassing authentication in development mode');
          // Set mock session and user
          const mockUser = {
            id: 'dev-user-id',
            email: 'dev@example.com',
            user_metadata: { name: 'Development User' },
          } as unknown as User;
          
          setUser(mockUser);
          // Set mock roles
          setUserRoles(DEV_CONFIG.AUTH.DEFAULT_ROLES);
          setLoading(false);
          return;
        }

        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session:', currentSession ? 'Active' : 'None');
        
        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);
          // Fetch user roles
          await fetchUserRoles(currentSession.user.id);
        } else {
          setUser(null);
          setUserRoles([]);
        }

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log('Auth state changed:', _event);
            setSession(newSession);

            if (newSession?.user) {
              setUser(newSession.user);
              // Fetch user roles
              await fetchUserRoles(newSession.user.id);
            } else {
              setUser(null);
              setUserRoles([]);
            }
          }
        );

        setLoading(false);

        // Cleanup subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth state management:', error);
        // Set default state on error to prevent UI issues
        setUser(null);
        setSession(null);
        setUserRoles([]);
        setLoading(false);
      }
    };

    // Initialize auth state
    handleAuthChange();
  }, [fetchUserRoles]);

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn,
        signUp,
        signOut,
        loading,
        resetPassword,
        updateProfile,
        userRoles,
        isAdmin,
        isMentor,
        isContentCreator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
