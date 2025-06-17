import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (isLoading: boolean, message?: string) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  isMounted: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const setLoading = useCallback((loading: boolean, message: string = '') => {
    // Only update loading state if mounted (client-side)
    if (isMounted) {
      setIsLoading(loading);
      setLoadingMessage(message);
    }
  }, [isMounted]);

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setIsMounted(true);
    
    // Optional: Sync with router events if using react-router
    const handleRouteChangeStart = () => {
      setLoading(true, 'Changing page...');
    };
    
    const handleRouteChangeComplete = () => {
      setLoading(false);
    };
    
    // Add event listeners for route changes if needed
    // This would need to be adapted for your specific router implementation
    // For example with react-router, you might use a history listener
    
    return () => {
      // Clean up event listeners if added
    };
  }, [setLoading]);

  const startLoading = useCallback((message: string = 'Loading...') => {
    setLoading(true, message);
  }, [setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        setLoading,
        startLoading,
        stopLoading,
        isMounted,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
