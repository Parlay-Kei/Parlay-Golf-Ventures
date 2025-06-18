import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
          <div className="space-y-6 animate-fade-in-slide">
            <div className="text-center">
              <h1 className="font-['Playfair_Display'] text-[24px] font-bold uppercase mb-1 text-[#1D1F1D] tracking-wide">
                WELCOME TO PGV
              </h1>
              <p className="text-[14px] font-normal font-['Inter'] text-[#1D1F1D] mb-6">
                Your journey starts here.
              </p>
              <span className="block text-[13px] font-medium uppercase text-[#1D1F1D] tracking-wide mb-4">
                Step 1 of 4 — Choose your crew handle
              </span>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#E9DCC9] shadow-inner flex items-center justify-center opacity-60"></div>
            </div>
            <label htmlFor="username" className="block text-[12px] uppercase font-medium font-['Inter'] text-[#1D1F1D] mb-1 tracking-tight">
              Username
            </label>
            <input
              id="username"
              value={onboardingData.username}
              onChange={(e) => updateOnboardingData({ username: e.target.value })}
              placeholder="@yourhandle"
              className="w-full h-12 px-4 py-3 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#004225]/30 focus:border-[#004225] transition-all duration-200 font-['Inter'] text-[12px] uppercase text-[#666] placeholder:text-[#B0B0B0]"
              maxLength={20}
            />
            <p className="text-xs text-[#888] font-medium font-['Inter'] mt-1 mb-2">This is how the community will know you.</p>
            <div className="mt-8 flex justify-end">
              <button type="button" onClick={handleNext} className="font-bold uppercase text-[14px] tracking-wider bg-gradient-to-r from-[#004225] to-[#007944] text-white shadow-none hover:shadow-lg hover:brightness-110 hover:-translate-y-0.5 focus:ring-2 focus:ring-[#C6A15B] focus:ring-offset-2 transition-all duration-200 rounded-[6px] px-8 py-3">
                Next &rarr;
              </button>
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
    <div className="min-h-screen flex items-center justify-center bg-[#F6F4EF]">
      <div className="max-w-[480px] w-full p-8 rounded-[12px] bg-[#F6F4EF] shadow-card animate-fade-in-slide">
        {/* PGV Logo Placeholder */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-[#E9DCC9] shadow-inner flex items-center justify-center opacity-80"></div>
        </div>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-[#E9DCC9] rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {/* Step Content */}
        {renderStep()}
        {/* Step Navigation (if needed) */}
      </div>
    </div>
  );
} 