/**
 * Beta Banner Component
 * 
 * This component displays a banner at the top of the page informing users
 * that the platform is currently in beta mode.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { betaService } from '@/lib/services/betaService';

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isBetaMode, setIsBetaMode] = useState(false);
  
  useEffect(() => {
    // Check if beta mode is enabled using the enhanced method
    setIsBetaMode(betaService.getCurrentBetaStatus());
    
    // Check if the banner has been dismissed before
    const isDismissed = localStorage.getItem('beta_banner_dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);
  
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('beta_banner_dismissed', 'true');
  };
  
  // Don't render if not in beta mode or if dismissed
  if (!isBetaMode || dismissed) {
    return null;
  }
  
  return (
    <div className="bg-blue-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-xs uppercase tracking-wider bg-white text-blue-600 rounded-full px-2 py-0.5 mr-2">
            BETA
          </span>
          <p className="text-sm">
            Welcome to the Parlay Golf Ventures beta! We're still improving things.
            <Link to="/beta/feedback" className="underline ml-2 font-medium">
              Share your feedback
            </Link>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-blue-100 focus:outline-none"
          aria-label="Dismiss beta banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
