import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentCreatorType, ContentCreatorContribution } from '@/lib/types/contribution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ContentCreatorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ContentCreatorType>('edited-clip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edited Clip form state
  const [clipTitle, setClipTitle] = useState('');
  const [clipDescription, setClipDescription] = useState('');
  const [clipVideoUrl, setClipVideoUrl] = useState('');
  
  // Commentary form state
  const [commentaryTitle, setCommentaryTitle] = useState('');
  const [commentaryDescription, setCommentaryDescription] = useState('');
  const [commentaryVideoUrl, setCommentaryVideoUrl] = useState('');
  
  // Gear Review form state
  const [gearTitle, setGearTitle] = useState('');
  const [gearDescription, setGearDescription] = useState('');
  const [gearBrand, setGearBrand] = useState('');
  const [gearRating, setGearRating] = useState('5');
  const [gearImageUrl, setGearImageUrl] = useState('');
  
  // Community Highlight form state
  const [highlightTitle, setHighlightTitle] = useState('');
  const [highlightDescription, setHighlightDescription] = useState('');
  const [highlightVideoUrl, setHighlightVideoUrl] = useState('');
  const [highlightTags, setHighlightTags] = useState('');
  
  // Form validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeTab === 'edited-clip') {
      if (!clipTitle.trim()) newErrors.clipTitle = 'Title is required';
      if (!clipDescription.trim()) newErrors.clipDescription = 'Description is required';
      if (!clipVideoUrl.trim()) newErrors.clipVideoUrl = 'Video URL is required';
    } else if (activeTab === 'commentary') {
      if (!commentaryTitle.trim()) newErrors.commentaryTitle = 'Title is required';
      if (!commentaryDescription.trim()) newErrors.commentaryDescription = 'Description is required';
      if (!commentaryVideoUrl.trim()) newErrors.commentaryVideoUrl = 'Video URL is required';
    } else if (activeTab === 'gear-review') {
      if (!gearTitle.trim()) newErrors.gearTitle = 'Title is required';
      if (!gearDescription.trim()) newErrors.gearDescription = 'Description is required';
      if (!gearBrand.trim()) newErrors.gearBrand = 'Brand is required';
    } else if (activeTab === 'community-highlight') {
      if (!highlightTitle.trim()) newErrors.highlightTitle = 'Title is required';
      if (!highlightDescription.trim()) newErrors.highlightDescription = 'Description is required';
      if (!highlightVideoUrl.trim()) newErrors.highlightVideoUrl = 'Video URL is required';
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
      
      let contributionData: Partial<ContentCreatorContribution> = {
        contributorId: user?.id || '',
        contributorType: 'creator',
        contributionType: activeTab as ContentCreatorType,
        status: 'approved', // Auto-approve content creator submissions
        isPublic: true,
        tags: [],
      };
      
      if (activeTab === 'edited-clip') {
        contributionData = {
          ...contributionData,
          title: clipTitle,
          description: clipDescription,
          videoUrl: clipVideoUrl,
          tags: ['edited-clip', 'video'],
        };
      } else if (activeTab === 'commentary') {
        contributionData = {
          ...contributionData,
          title: commentaryTitle,
          description: commentaryDescription,
          videoUrl: commentaryVideoUrl,
          tags: ['commentary', 'video'],
        };
      } else if (activeTab === 'gear-review') {
        contributionData = {
          ...contributionData,
          title: gearTitle,
          description: gearDescription,
          gearBrand: gearBrand,
          rating: parseInt(gearRating),
          gearModel: undefined,
          gearType: undefined,
          videoUrl: undefined,
          pros: undefined,
          cons: undefined,
          featuredCommunityMember: undefined,
          highlightType: undefined,
          gearModel: undefined,
          gearType: undefined,
          image_url: gearImageUrl,
          tags: ['gear-review', gearBrand],
        };
      } else if (activeTab === 'community-highlight') {
        contributionData = {
          ...contributionData,
          title: highlightTitle,
          description: highlightDescription,
          videoUrl: highlightVideoUrl,
          tags: highlightTags.split(',').map(tag => tag.trim()),
        };
      }
      
      await contributionsApi.createContribution(contributionData);
      
      // Reset form
      resetForm();
      
      toast.success('Contribution submitted and approved! It will now appear in the Community Content Hub.');
      navigate('/contribute/hub');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Failed to submit your contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setClipTitle('');
    setClipDescription('');
    setClipVideoUrl('');
    setCommentaryTitle('');
    setCommentaryDescription('');
    setCommentaryVideoUrl('');
    setGearTitle('');
    setGearDescription('');
    setGearBrand('');
    setGearRating('5');
    setGearImageUrl('');
    setHighlightTitle('');
    setHighlightDescription('');
    setHighlightVideoUrl('');
    setHighlightTags('');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Content Creator Contributions</CardTitle>
              <CardDescription>
                Share your expertise and content with the PGV community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentCreatorType)}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                  <TabsTrigger value="edited-clip">Edited Clip</TabsTrigger>
                  <TabsTrigger value="commentary">Commentary</TabsTrigger>
                  <TabsTrigger value="gear-review">Gear Review</TabsTrigger>
                  <TabsTrigger value="community-highlight">Community Highlight</TabsTrigger>
                </TabsList>
                
                <TabsContent value="edited-clip">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="clip-title">Title</Label>
                      <Input 
                        id="clip-title" 
                        placeholder="Swing Analysis: The Perfect Driver" 
                        value={clipTitle}
                        onChange={(e) => setClipTitle(e.target.value)}
                        className={errors.clipTitle ? 'border-red-500' : ''}
                      />
                      {errors.clipTitle && (
                        <p className="text-sm text-red-500">{errors.clipTitle}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clip-description">Description</Label>
                      <Textarea 
                        id="clip-description" 
                        placeholder="Describe your edited clip and what viewers will learn" 
                        value={clipDescription}
                        onChange={(e) => setClipDescription(e.target.value)}
                        className={errors.clipDescription ? 'border-red-500' : ''}
                      />
                      {errors.clipDescription && (
                        <p className="text-sm text-red-500">{errors.clipDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clip-video-url">Video URL</Label>
                      <Input 
                        id="clip-video-url" 
                        placeholder="https://youtube.com/..." 
                        value={clipVideoUrl}
                        onChange={(e) => setClipVideoUrl(e.target.value)}
                        className={errors.clipVideoUrl ? 'border-red-500' : ''}
                      />
                      {errors.clipVideoUrl && (
                        <p className="text-sm text-red-500">{errors.clipVideoUrl}</p>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Edited Clip'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="commentary">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="commentary-title">Title</Label>
                      <Input 
                        id="commentary-title" 
                        placeholder="Tournament Breakdown: Masters 2025" 
                        value={commentaryTitle}
                        onChange={(e) => setCommentaryTitle(e.target.value)}
                        className={errors.commentaryTitle ? 'border-red-500' : ''}
                      />
                      {errors.commentaryTitle && (
                        <p className="text-sm text-red-500">{errors.commentaryTitle}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="commentary-description">Description</Label>
                      <Textarea 
                        id="commentary-description" 
                        placeholder="Describe your commentary and key insights" 
                        value={commentaryDescription}
                        onChange={(e) => setCommentaryDescription(e.target.value)}
                        className={errors.commentaryDescription ? 'border-red-500' : ''}
                      />
                      {errors.commentaryDescription && (
                        <p className="text-sm text-red-500">{errors.commentaryDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="commentary-video-url">Video URL</Label>
                      <Input 
                        id="commentary-video-url" 
                        placeholder="https://youtube.com/..." 
                        value={commentaryVideoUrl}
                        onChange={(e) => setCommentaryVideoUrl(e.target.value)}
                        className={errors.commentaryVideoUrl ? 'border-red-500' : ''}
                      />
                      {errors.commentaryVideoUrl && (
                        <p className="text-sm text-red-500">{errors.commentaryVideoUrl}</p>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Commentary'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="gear-review">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="gear-title">Review Title</Label>
                      <Input 
                        id="gear-title" 
                        placeholder="TaylorMade Stealth 2 Driver Review" 
                        value={gearTitle}
                        onChange={(e) => setGearTitle(e.target.value)}
                        className={errors.gearTitle ? 'border-red-500' : ''}
                      />
                      {errors.gearTitle && (
                        <p className="text-sm text-red-500">{errors.gearTitle}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gear-description">Review Content</Label>
                      <Textarea 
                        id="gear-description" 
                        placeholder="Provide your detailed review of this golf equipment" 
                        value={gearDescription}
                        onChange={(e) => setGearDescription(e.target.value)}
                        className={`min-h-[150px] ${errors.gearDescription ? 'border-red-500' : ''}`}
                      />
                      {errors.gearDescription && (
                        <p className="text-sm text-red-500">{errors.gearDescription}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gear-brand">Brand</Label>
                        <Input 
                          id="gear-brand" 
                          placeholder="TaylorMade, Callaway, etc." 
                          value={gearBrand}
                          onChange={(e) => setGearBrand(e.target.value)}
                          className={errors.gearBrand ? 'border-red-500' : ''}
                        />
                        {errors.gearBrand && (
                          <p className="text-sm text-red-500">{errors.gearBrand}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gear-rating">Rating (1-10)</Label>
                        <Select 
                          value={gearRating} 
                          onValueChange={setGearRating}
                        >
                          <SelectTrigger id="gear-rating">
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gear-image-url">Image URL (optional)</Label>
                      <Input 
                        id="gear-image-url" 
                        placeholder="https://example.com/image.jpg" 
                        value={gearImageUrl}
                        onChange={(e) => setGearImageUrl(e.target.value)}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Gear Review'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="community-highlight">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="highlight-title">Title</Label>
                      <Input 
                        id="highlight-title" 
                        placeholder="Community Member Spotlight: John's Progress" 
                        value={highlightTitle}
                        onChange={(e) => setHighlightTitle(e.target.value)}
                        className={errors.highlightTitle ? 'border-red-500' : ''}
                      />
                      {errors.highlightTitle && (
                        <p className="text-sm text-red-500">{errors.highlightTitle}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="highlight-description">Description</Label>
                      <Textarea 
                        id="highlight-description" 
                        placeholder="Describe this community highlight and why it's noteworthy" 
                        value={highlightDescription}
                        onChange={(e) => setHighlightDescription(e.target.value)}
                        className={errors.highlightDescription ? 'border-red-500' : ''}
                      />
                      {errors.highlightDescription && (
                        <p className="text-sm text-red-500">{errors.highlightDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="highlight-video-url">Video URL</Label>
                      <Input 
                        id="highlight-video-url" 
                        placeholder="https://youtube.com/..." 
                        value={highlightVideoUrl}
                        onChange={(e) => setHighlightVideoUrl(e.target.value)}
                        className={errors.highlightVideoUrl ? 'border-red-500' : ''}
                      />
                      {errors.highlightVideoUrl && (
                        <p className="text-sm text-red-500">{errors.highlightVideoUrl}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="highlight-tags">Tags (comma separated)</Label>
                      <Input 
                        id="highlight-tags" 
                        placeholder="community, progress, achievement" 
                        value={highlightTags}
                        onChange={(e) => setHighlightTags(e.target.value)}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Community Highlight'
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
      </main>
      
      <Footer />
    </div>
  );
};

export default ContentCreatorPage;
