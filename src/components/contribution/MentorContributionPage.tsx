import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MentorContributionType } from '@/lib/types/contribution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { MentorContribution } from '@/lib/types/contribution';

const MentorContributionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MentorContributionType>('swing-breakdown');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSwings, setPendingSwings] = useState<{ id: string; title: string; contributionType: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Swing Breakdown form state
  const [targetSwingId, setTargetSwingId] = useState('');
  const [breakdownTitle, setBreakdownTitle] = useState('');
  const [breakdownDescription, setBreakdownDescription] = useState('');
  const [breakdownVideoUrl, setBreakdownVideoUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<'technical' | 'conceptual' | 'both'>('both');
  const [keyPoints, setKeyPoints] = useState('');
  
  // AI Tutorial form state
  const [tutorialTitle, setTutorialTitle] = useState('');
  const [tutorialDescription, setTutorialDescription] = useState('');
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  // Fetch pending swings for review
  useEffect(() => {
    const fetchPendingSwings = async () => {
      try {
        setIsLoading(true);
        const data = await contributionsApi.getPendingSwingsForReview();
        setPendingSwings(data || []);
      } catch (error) {
        console.error('Error fetching pending swings:', error);
        toast.error('Failed to load pending swings for review');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingSwings();
  }, []);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeTab === 'swing-breakdown') {
      if (!breakdownTitle.trim()) newErrors.breakdownTitle = 'Title is required';
      if (!breakdownDescription.trim()) newErrors.breakdownDescription = 'Analysis is required';
    } else if (activeTab === 'ai-tutorial') {
      if (!tutorialTitle.trim()) newErrors.tutorialTitle = 'Title is required';
      if (!tutorialDescription.trim()) newErrors.tutorialDescription = 'Description is required';
      if (!tutorialVideoUrl.trim()) newErrors.tutorialVideoUrl = 'Video URL is required';
      if (!aiModel.trim()) newErrors.aiModel = 'AI model is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in as a mentor to submit a contribution');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let contributionData: Partial<MentorContribution> = {
        contributorId: user.id,
        contributorType: 'mentor',
        contributionType: activeTab as MentorContributionType,
        status: 'approved',
        isPublic: true,
      };
      
      if (activeTab === 'swing-breakdown') {
        contributionData = {
          ...contributionData,
          title: breakdownTitle,
          description: breakdownDescription,
          videoUrl: breakdownVideoUrl,
          targetSwingId,
          analysisType,
          keyPoints: keyPoints.split('\n').filter(point => point.trim() !== ''),
        };
      } else if (activeTab === 'ai-tutorial') {
        contributionData = {
          ...contributionData,
          title: tutorialTitle,
          description: tutorialDescription,
          videoUrl: tutorialVideoUrl,
          aiModel,
          promptUsed,
          difficultyLevel,
        };
      }
      
      await contributionsApi.createContribution(contributionData);
      toast.success('Contribution submitted and approved! It will now appear in the Community Content Hub.');
      navigate('/contribute/hub');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Mentor Contributions</h1>
            <p className="text-xl text-muted-foreground">
              Share your expertise and help the PGV community improve their game
            </p>
          </div>
          
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>What would you like to contribute?</CardTitle>
              <CardDescription>
                Choose a contribution type and fill out the form below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MentorContributionType)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="swing-breakdown">Swing Breakdown</TabsTrigger>
                  <TabsTrigger value="ai-tutorial">AI Tutorial</TabsTrigger>
                </TabsList>
                
                <TabsContent value="swing-breakdown">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-swing">Select Swing to Analyze</Label>
                      {isLoading ? (
                        <div className="py-2">Loading pending swings...</div>
                      ) : pendingSwings.length > 0 ? (
                        <Select 
                          value={targetSwingId} 
                          onValueChange={setTargetSwingId}
                        >
                          <SelectTrigger id="target-swing">
                            <SelectValue placeholder="Select a swing to analyze" />
                          </SelectTrigger>
                          <SelectContent>
                            {pendingSwings.map((swing) => (
                              <SelectItem key={swing.id} value={swing.id}>
                                {swing.title} ({swing.contributionType === 'swing-demo' ? 'Guest' : 'Member'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="py-2 text-muted-foreground">
                          No pending swings available for analysis. You can still create a general breakdown.
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="breakdown-title">Title</Label>
                      <Input 
                        id="breakdown-title" 
                        placeholder="Swing Analysis: Driver Technique" 
                        value={breakdownTitle}
                        onChange={(e) => setBreakdownTitle(e.target.value)}
                        required
                        className={errors.breakdownTitle ? "border-red-500" : ""}
                      />
                      {errors.breakdownTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.breakdownTitle}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="breakdown-description">Analysis</Label>
                      <Textarea 
                        id="breakdown-description" 
                        placeholder="Provide your detailed analysis of the swing" 
                        className={`min-h-[150px] ${errors.breakdownDescription ? "border-red-500" : ""}`}
                        value={breakdownDescription}
                        onChange={(e) => setBreakdownDescription(e.target.value)}
                        required
                      />
                      {errors.breakdownDescription && (
                        <p className="text-red-500 text-sm mt-1">{errors.breakdownDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="breakdown-video-url">Video URL (Optional)</Label>
                      <Input 
                        id="breakdown-video-url" 
                        placeholder="https://youtu.be/example" 
                        value={breakdownVideoUrl}
                        onChange={(e) => setBreakdownVideoUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="analysis-type">Analysis Type</Label>
                      <Select 
                        value={analysisType} 
                        onValueChange={(value) => setAnalysisType(value as 'technical' | 'conceptual' | 'both')}
                      >
                        <SelectTrigger id="analysis-type">
                          <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="conceptual">Conceptual</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="key-points">Key Points (One per line)</Label>
                      <Textarea 
                        id="key-points" 
                        placeholder="Key point 1\nKey point 2\nKey point 3" 
                        className="min-h-[100px]"
                        value={keyPoints}
                        onChange={(e) => setKeyPoints(e.target.value)}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Swing Breakdown'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="ai-tutorial">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="tutorial-title">Title</Label>
                      <Input 
                        id="tutorial-title" 
                        placeholder="AI-Generated Golf Tip: Improving Your Swing" 
                        value={tutorialTitle}
                        onChange={(e) => setTutorialTitle(e.target.value)}
                        required
                        className={errors.tutorialTitle ? "border-red-500" : ""}
                      />
                      {errors.tutorialTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.tutorialTitle}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tutorial-description">Description</Label>
                      <Textarea 
                        id="tutorial-description" 
                        placeholder="Describe what this AI tutorial covers" 
                        className={`min-h-[150px] ${errors.tutorialDescription ? "border-red-500" : ""}`}
                        value={tutorialDescription}
                        onChange={(e) => setTutorialDescription(e.target.value)}
                        required
                      />
                      {errors.tutorialDescription && (
                        <p className="text-red-500 text-sm mt-1">{errors.tutorialDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tutorial-video-url">Video URL</Label>
                      <Input 
                        id="tutorial-video-url" 
                        placeholder="https://youtu.be/example" 
                        value={tutorialVideoUrl}
                        onChange={(e) => setTutorialVideoUrl(e.target.value)}
                        required
                        className={errors.tutorialVideoUrl ? "border-red-500" : ""}
                      />
                      {errors.tutorialVideoUrl && (
                        <p className="text-red-500 text-sm mt-1">{errors.tutorialVideoUrl}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ai-model">AI Model Used</Label>
                      <Input 
                        id="ai-model" 
                        placeholder="GPT-4, Claude, etc." 
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        required
                        className={errors.aiModel ? "border-red-500" : ""}
                      />
                      {errors.aiModel && (
                        <p className="text-red-500 text-sm mt-1">{errors.aiModel}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prompt-used">Prompt Used</Label>
                      <Textarea 
                        id="prompt-used" 
                        placeholder="Share the prompt you used to generate this tutorial" 
                        value={promptUsed}
                        onChange={(e) => setPromptUsed(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="difficulty-level">Difficulty Level</Label>
                      <Select 
                        value={difficultyLevel} 
                        onValueChange={(value) => setDifficultyLevel(value as 'beginner' | 'intermediate' | 'advanced')}
                      >
                        <SelectTrigger id="difficulty-level">
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit AI Tutorial'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/contribute')}>
                Back to Contribution Hub
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MentorContributionPage;
