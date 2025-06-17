import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GuestContributionType } from '@/lib/types/contribution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { GuestContribution } from '@/lib/types/contribution';

const GuestContributionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GuestContributionType>('swing-demo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Swing Demo form state
  const [swingDemoTitle, setSwingDemoTitle] = useState('');
  const [swingDemoDescription, setSwingDemoDescription] = useState('');
  const [swingDemoUrl, setSwingDemoUrl] = useState('');
  const [swingCategory, setSwingCategory] = useState('');
  
  // Idea form state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaImpact, setIdeaImpact] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Generate a guest ID since they don't have an account
      const guestId = uuidv4();
      
      let contributionData: Partial<GuestContribution> = {
        contributorId: guestId,
        contributorType: 'guest',
        contributionType: activeTab as GuestContributionType,
        status: 'pending',
        isPublic: true,
        description: `Submitted by: ${guestName || 'Anonymous'}, Email: ${guestEmail || 'Not provided'}\n\n`,
      };
      
      if (activeTab === 'swing-demo') {
        contributionData = {
          ...contributionData,
          title: swingDemoTitle,
          description: contributionData.description + swingDemoDescription,
          videoUrl: swingDemoUrl,
          category: swingCategory,
        };
      } else if (activeTab === 'idea') {
        contributionData = {
          ...contributionData,
          title: ideaTitle,
          description: contributionData.description + ideaDescription,
          impact: ideaImpact,
        };
      }
      
      await contributionsApi.createContribution(contributionData);
      toast.success('Contribution submitted successfully!');
      navigate('/contribute/hub');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Guest Contributions</h1>
        <p className="text-xl text-muted-foreground">
          Share your swing or ideas with the Parlay Golf Ventures community
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GuestContributionType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="swing-demo">Submit Swing Demo</TabsTrigger>
              <TabsTrigger value="idea">Propose Idea</TabsTrigger>
            </TabsList>
            
            <TabsContent value="swing-demo">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">Your Name (Optional)</Label>
                    <Input 
                      id="guest-name" 
                      placeholder="John Doe" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Your Email (Optional)</Label>
                    <Input 
                      id="guest-email" 
                      type="email"
                      placeholder="john@example.com" 
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swing-demo-title">Title</Label>
                  <Input 
                    id="swing-demo-title" 
                    placeholder="My Swing Analysis Request" 
                    value={swingDemoTitle}
                    onChange={(e) => setSwingDemoTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swing-demo-description">Description</Label>
                  <Textarea 
                    id="swing-demo-description" 
                    placeholder="Briefly describe your swing and what you'd like feedback on" 
                    value={swingDemoDescription}
                    onChange={(e) => setSwingDemoDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swing-demo-url">Video URL</Label>
                  <Input 
                    id="swing-demo-url" 
                    placeholder="https://youtu.be/example" 
                    value={swingDemoUrl}
                    onChange={(e) => setSwingDemoUrl(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swing-category">Swing Category</Label>
                  <Input 
                    id="swing-category" 
                    placeholder="Driver, Iron, Putting, etc." 
                    value={swingCategory}
                    onChange={(e) => setSwingCategory(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Swing Demo'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="idea">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name-idea">Your Name (Optional)</Label>
                    <Input 
                      id="guest-name-idea" 
                      placeholder="John Doe" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-email-idea">Your Email (Optional)</Label>
                    <Input 
                      id="guest-email-idea" 
                      type="email"
                      placeholder="john@example.com" 
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idea-title">Idea Title</Label>
                  <Input 
                    id="idea-title" 
                    placeholder="My Feature Suggestion" 
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idea-description">Description</Label>
                  <Textarea 
                    id="idea-description" 
                    placeholder="Describe your idea or feature request in detail" 
                    className="min-h-[200px]"
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idea-impact">Potential Impact</Label>
                  <Select 
                    value={ideaImpact} 
                    onValueChange={(value) => setIdeaImpact(value as 'low' | 'medium' | 'high')}
                  >
                    <SelectTrigger id="idea-impact">
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Propose Idea'}
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

export default GuestContributionPage;
