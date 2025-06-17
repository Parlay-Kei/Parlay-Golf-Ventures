import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Rocket, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { betaService } from '@/lib/services/betaService';

interface BetaModeToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function BetaModeToggle({ checked, onCheckedChange }: BetaModeToggleProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetState, setTargetState] = useState(checked);

  // Handle toggle click - show confirmation dialog when turning off beta mode
  const handleToggleClick = (newState: boolean) => {
    if (checked && !newState) {
      // If turning off beta mode, show confirmation dialog
      setTargetState(newState);
      setShowConfirmation(true);
    } else {
      // If turning on beta mode or already off, just update directly
      onCheckedChange(newState);
    }
  };

  // Handle confirmation dialog confirm action
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Call the betaService to toggle beta mode
      await betaService.toggleBetaMode(targetState);
      
      // Update the state through the parent component
      onCheckedChange(targetState);
      
      // Show success toast
      toast({
        title: targetState ? "Beta Mode Enabled" : "Platform Going Live!",
        description: targetState 
          ? "The platform is now in beta mode. Only invited users can access it."
          : "Beta mode is disabled. The platform is now in production mode!",
        variant: "default",
      });
      
      // Close the dialog
      setShowConfirmation(false);
      
      // If we're going live, reload the page after a delay to show the changes
      if (!targetState) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error toggling beta mode:', error);
      toast({
        title: "Error",
        description: "Failed to update platform mode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <Label htmlFor="betaMode" className="text-base font-medium flex items-center">
            <Rocket className="h-4 w-4 mr-2 text-blue-600" />
            Beta Mode
          </Label>
          <p className="text-sm text-gray-500">
            {checked 
              ? "The platform is currently in beta mode. Only invited users can access it." 
              : "The platform is in production mode and publicly accessible."}
          </p>
        </div>
        <Switch 
          id="betaMode" 
          checked={checked} 
          onCheckedChange={handleToggleClick}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-700">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm Platform Go-Live
            </DialogTitle>
            <DialogDescription>
              You are about to disable beta mode and make the platform publicly accessible.
              This will hide the beta banner and feedback options for all users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
            <h4 className="font-medium text-amber-800 mb-2">This action will:</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                Remove the beta banner from all pages
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                Disable the feedback collection mechanism
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                Track new user signups as production users
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                Enable signup analytics on the dashboard
              </li>
            </ul>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-between">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
              className="flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
