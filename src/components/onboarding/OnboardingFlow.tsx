import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ArrowRight, Upload, Users, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingData {
  username: string;
  avatar: string;
  crewId: string;
  hasUploadedSwing: boolean;
}

interface Crew {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

const AVATAR_OPTIONS = [
  { id: 'golfer1', src: '/images/avatars/golfer1.png', alt: 'Golfer 1' },
  { id: 'golfer2', src: '/images/avatars/golfer2.png', alt: 'Golfer 2' },
  { id: 'golfer3', src: '/images/avatars/golfer3.png', alt: 'Golfer 3' },
  { id: 'golfer4', src: '/images/avatars/golfer4.png', alt: 'Golfer 4' },
  { id: 'golfer5', src: '/images/avatars/golfer5.png', alt: 'Golfer 5' },
  { id: 'golfer6', src: '/images/avatars/golfer6.png', alt: 'Golfer 6' },
];

const CREW_OPTIONS: Crew[] = [
  { id: 'beginners', name: 'Beginner Crew', description: 'Perfect for new golfers starting their journey', memberCount: 45 },
  { id: 'intermediate', name: 'Intermediate Crew', description: 'For golfers looking to improve their game', memberCount: 32 },
  { id: 'advanced', name: 'Advanced Crew', description: 'For experienced golfers pushing their limits', memberCount: 28 },
  { id: 'competitive', name: 'Competitive Crew', description: 'For tournament players and serious competitors', memberCount: 19 },
];

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    username: '',
    avatar: '',
    crewId: '',
    hasUploadedSwing: false,
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: onboardingData.username,
          avatar_url: onboardingData.avatar,
          crew_id: onboardingData.crewId,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Welcome to PGV!",
        description: "Your profile has been set up successfully.",
      });

      onComplete(onboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Pick Your Username</h2>
              <p className="text-muted-foreground">Choose a unique username for your PGV profile</p>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={onboardingData.username}
                onChange={(e) => updateOnboardingData({ username: e.target.value })}
                placeholder="Enter your username"
                className="text-center text-lg"
                maxLength={20}
              />
              <p className="text-sm text-muted-foreground text-center">
                This will be your display name in the community
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Select Your Avatar</h2>
              <p className="text-muted-foreground">Choose an avatar to represent you in the community</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => updateOnboardingData({ avatar: avatar.src })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    onboardingData.avatar === avatar.src
                      ? 'border-pgv-green bg-pgv-green/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={avatar.src} alt={avatar.alt} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Join a Crew</h2>
              <p className="text-muted-foreground">Connect with golfers at your skill level</p>
            </div>
            
            <div className="space-y-4">
              {CREW_OPTIONS.map((crew) => (
                <button
                  key={crew.id}
                  onClick={() => updateOnboardingData({ crewId: crew.id })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    onboardingData.crewId === crew.id
                      ? 'border-pgv-green bg-pgv-green/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{crew.name}</h3>
                      <p className="text-sm text-muted-foreground">{crew.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {crew.memberCount}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Upload Your First Swing (Optional)</h2>
              <p className="text-muted-foreground">Get started with swing analysis or skip for now</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Upload Swing Video</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drop your swing video here or click to browse
                </p>
                <Button variant="outline" className="w-full">
                  Choose File
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => updateOnboardingData({ hasUploadedSwing: false })}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.username.trim().length >= 3;
      case 2:
        return onboardingData.avatar !== '';
      case 3:
        return onboardingData.crewId !== '';
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to PGV</CardTitle>
          <CardDescription>Let's get you set up</CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 