import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A hook that scrolls the window to the top when the component mounts
 * or when the route changes
 */
export function useScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
} 