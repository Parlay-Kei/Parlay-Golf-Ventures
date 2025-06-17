/**
 * Beta Access Form Component
 * 
 * This component handles the beta invite code verification during signup.
 * It is displayed when the application is in beta mode.
 */

import { useState } from 'react';
import { betaService } from '@/lib/services/betaService';
import { handleApiError } from '@/lib/utils/errorHandler';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'react-hot-toast';

interface BetaAccessFormProps {
  onVerified: () => void;
  onCancel: () => void;
}

export function BetaAccessForm({ onVerified, onCancel }: BetaAccessFormProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Please enter your invite code');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = await betaService.validateInviteCode(inviteCode.trim());
      
      if (isValid) {
        // Store the valid code in session storage for later use during account creation
        sessionStorage.setItem('betaInviteCode', inviteCode.trim());
        toast.success('Invite code verified successfully!');
        onVerified();
      } else {
        setError('Invalid or expired invite code. Please check and try again.');
      }
    } catch (err) {
      handleApiError(err, 'Failed to verify invite code');
      setError('An error occurred while verifying your invite code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Beta Access Required</CardTitle>
        <CardDescription>
          Parlay Golf Ventures is currently in beta. Please enter your invite code to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="inviteCode" className="block text-sm font-medium">
              Invite Code
            </label>
            <Input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your invite code (e.g., XXXX-XXXX-XXXX)"
              className="w-full"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isVerifying || !inviteCode.trim()}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
