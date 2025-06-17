import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';

// Define feature flags and their required tiers
export const FEATURES = {
  BASIC_TUTORIALS: {
    name: 'Basic Tutorials',
    requiredTier: 'free' as const,
    description: 'Access to basic golf tutorials'
  },
  AI_ANALYSIS: {
    name: 'AI Analysis',
    requiredTier: 'aspiring' as const,
    description: 'Access to detailed AI swing analysis'
  },
  PGV_ACADEMY: {
    name: 'PGV Academy',
    requiredTier: 'breakthrough' as const,
    description: 'Access to premium PGV Academy content'
  },
  MENTOR_REVIEWS: {
    name: 'Mentor Reviews',
    requiredTier: 'breakthrough' as const,
    description: 'Access to schedule mentor reviews'
  }
} as const;

type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough';

interface FeatureContextType {
  hasAccess: (feature: keyof typeof FEATURES) => boolean;
  userTier: SubscriptionTier | null;
  isLoading: boolean;
}

const FeatureContext = createContext<FeatureContextType | null>(null);

interface FeatureProviderProps {
  children: ReactNode;
}

export function FeatureProvider({ children }: FeatureProviderProps): JSX.Element {
  const [userTier, setUserTier] = useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserTier() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserTier(null);
          return;
        }

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single();

        setUserTier(subscription?.tier || null);
      } catch (error) {
        console.error('Error fetching user tier:', error);
        setUserTier(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserTier();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserTier();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasAccess = (feature: keyof typeof FEATURES): boolean => {
    if (!userTier) return false;
    
    const requiredTier = FEATURES[feature].requiredTier;
    const tierOrder: Record<SubscriptionTier, number> = {
      'free': 0,
      'driven': 1,
      'aspiring': 2,
      'breakthrough': 3
    };

    return tierOrder[userTier] >= tierOrder[requiredTier];
  };

  const contextValue: FeatureContextType = {
    hasAccess,
    userTier,
    isLoading
  };

  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures(): FeatureContextType {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
} 