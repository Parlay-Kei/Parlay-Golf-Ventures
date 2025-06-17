import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberContributionType } from '@/lib/types/contribution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { MemberContribution } from '@/lib/types/contribution';

const MemberContributionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MemberContributionType>('swing-video');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Swing Video form state
  const [swingVideoTitle, setSwingVideoTitle] = useState('');
  const [swingVideoDescription, setSwingVideoDescription] = useState('');
  const [swingVideoUrl, setSwingVideoUrl] = useState('');
  const [swingType, setSwingType] = useState<'driver' | 'iron' | 'wedge' | 'putting'>('driver');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  // Tutorial Topic form state
  const [tutorialTitle, setTutorialTitle] = useState('');
  const [tutorialDescription, setTutorialDescription] = useState('');
  const [tutorialTags, setTutorialTags] = useState('');
  
  // Personal Story form state
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyTags, setStoryTags] = useState('');
  
  // Form validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeTab === 'swing-video') {
      if (!swingVideoTitle.trim()) newErrors.swingVideoTitle = 'Title is required';
      if (!swingVideoDescription.trim()) newErrors.swingVideoDescription = 'Description is required';
      if (!swingVideoUrl.trim()) newErrors.swingVideoUrl = 'Video URL is required';
    } else if (activeTab === 'tutorial-topic') {
      if (!tutorialTitle.trim()) newErrors.tutorialTitle = 'Title is required';
      if (!tutorialDescription.trim()) newErrors.tutorialDescription = 'Description is required';
    } else if (activeTab === 'personal-story') {
      if (!storyTitle.trim()) newErrors.storyTitle = 'Title is required';
      if (!storyContent.trim()) newErrors.storyContent = 'Story content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let contributionData: Partial<MemberContribution> = {
        contributorId: user?.id || '',
        contributorType: 'member',
        contributionType: activeTab as MemberContributionType,
        status: 'pending',
        isPublic: true,
        tags: [],
      };
      
      if (activeTab === 'swing-video') {
        contributionData = {
          ...contributionData,
          title: swingVideoTitle,
          description: swingVideoDescription,
          videoUrl: swingVideoUrl,
          swingType: swingType,
          difficultyLevel: difficultyLevel,
          tags: ['swing', swingType, difficultyLevel],
        };
      } else if (activeTab === 'tutorial-topic') {
        contributionData = {
          ...contributionData,
          title: tutorialTitle,
          description: tutorialDescription,
          tags: tutorialTags.split(',').map(tag => tag.trim()),
        };
      } else if (activeTab === 'personal-story') {
        contributionData = {
          ...contributionData,
          title: storyTitle,
          description: storyContent,
          tags: storyTags.split(',').map(tag => tag.trim()),
        };
      }
      
      await contributionsApi.createContribution(contributionData);
      
      toast.success('Your contribution has been submitted successfully!');
      navigate('/contribute/hub');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Failed to submit your contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>What would you like to contribute?</CardTitle>
          <CardDescription>
            Choose a contribution type and fill out the form below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MemberContributionType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="swing-video">Swing Video</TabsTrigger>
              <TabsTrigger value="tutorial-topic">Tutorial Topic</TabsTrigger>
              <TabsTrigger value="personal-story">Personal Story</TabsTrigger>
            </TabsList>
            
            <TabsContent value="swing-video">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="swing-title">Title</Label>
                  <Input 
                    id="swing-title" 
                    placeholder="My Driver Swing" 
                    value={swingVideoTitle}
                    onChange={(e) => setSwingVideoTitle(e.target.value)}
                    className={errors.swingVideoTitle ? 'border-red-500' : ''}
                  />
                  {errors.swingVideoTitle && (
                    <p className="text-sm text-red-500">{errors.swingVideoTitle}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swing-description">Description</Label>
                  <Textarea 
                    id="swing-description" 
                    placeholder="Describe your swing and what you'd like feedback on" 
                    value={swingVideoDescription}
                    onChange={(e) => setSwingVideoDescription(e.target.value)}
                    className={errors.swingVideoDescription ? 'border-red-500' : ''}
                  />
                  {errors.swingVideoDescription && (
                    <p className="text-sm text-red-500">{errors.swingVideoDescription}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swing-video-url">Video URL</Label>
                  <Input 
                    id="swing-video-url" 
                    placeholder="https://youtube.com/..." 
                    value={swingVideoUrl}
                    onChange={(e) => setSwingVideoUrl(e.target.value)}
                    className={errors.swingVideoUrl ? 'border-red-500' : ''}
                  />
                  {errors.swingVideoUrl && (
                    <p className="text-sm text-red-500">{errors.swingVideoUrl}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="swing-type">Swing Type</Label>
                    <Select 
                      value={swingType} 
                      onValueChange={(value) => setSwingType(value as 'driver' | 'iron' | 'wedge' | 'putting')}
                    >
                      <SelectTrigger id="swing-type">
                        <SelectValue placeholder="Select swing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="iron">Iron</SelectItem>
                        <SelectItem value="wedge">Wedge</SelectItem>
                        <SelectItem value="putting">Putting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty-level">Your Skill Level</Label>
                    <Select 
                      value={difficultyLevel} 
                      onValueChange={(value) => setDifficultyLevel(value as 'beginner' | 'intermediate' | 'advanced')}
                    >
                      <SelectTrigger id="difficulty-level">
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Swing Video'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="tutorial-topic">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorial-title">Topic Title</Label>
                  <Input 
                    id="tutorial-title" 
                    placeholder="How to Fix a Slice" 
                    value={tutorialTitle}
                    onChange={(e) => setTutorialTitle(e.target.value)}
                    className={errors.tutorialTitle ? 'border-red-500' : ''}
                  />
                  {errors.tutorialTitle && (
                    <p className="text-sm text-red-500">{errors.tutorialTitle}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tutorial-description">Description</Label>
                  <Textarea 
                    id="tutorial-description" 
                    placeholder="Describe what you'd like to learn about this topic" 
                    value={tutorialDescription}
                    onChange={(e) => setTutorialDescription(e.target.value)}
                    className={errors.tutorialDescription ? 'border-red-500' : ''}
                  />
                  {errors.tutorialDescription && (
                    <p className="text-sm text-red-500">{errors.tutorialDescription}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tutorial-tags">Tags (comma separated)</Label>
                  <Input 
                    id="tutorial-tags" 
                    placeholder="swing, driver, slice" 
                    value={tutorialTags}
                    onChange={(e) => setTutorialTags(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Suggest Tutorial Topic'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="personal-story">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="story-title">Story Title</Label>
                  <Input 
                    id="story-title" 
                    placeholder="My First Hole-in-One" 
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className={errors.storyTitle ? 'border-red-500' : ''}
                  />
                  {errors.storyTitle && (
                    <p className="text-sm text-red-500">{errors.storyTitle}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="story-content">Your Story</Label>
                  <Textarea 
                    id="story-content" 
                    placeholder="Share your golf journey or experience" 
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    className={`min-h-[200px] ${errors.storyContent ? 'border-red-500' : ''}`}
                  />
                  {errors.storyContent && (
                    <p className="text-sm text-red-500">{errors.storyContent}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="story-tags">Tags (comma separated)</Label>
                  <Input 
                    id="story-tags" 
                    placeholder="hole-in-one, achievement, personal" 
                    value={storyTags}
                    onChange={(e) => setStoryTags(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Share Your Story'
                  )}
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
  );
};

export default MemberContributionPage;
