 import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContributorType } from '@/lib/types/contribution';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ContributionLandingPage = () => {
  const navigate = useNavigate();

  const contributorTypes: { type: ContributorType; title: string; description: string; icon: string }[] = [
    {
      type: 'member',
      title: 'PGV Member',
      description: 'Submit swing videos, suggest tutorial topics, or share your personal golf journey.',
      icon: '🏌️‍♂️',
    },
    {
      type: 'guest',
      title: 'Non-Member Guest',
      description: 'Submit anonymous swing demos or propose ideas for platform improvements.',
      icon: '👋',
    },
    {
      type: 'mentor',
      title: 'Mentor',
      description: 'Break down community swings or upload AI-powered tutorial responses.',
      icon: '👨‍🏫',
    },
    {
      type: 'creator',
      title: 'Content Creator',
      description: 'Submit edited clips, commentary, gear reviews, or community highlights.',
      icon: '🎥',
    },
  ];

  const handleContributorSelect = (type: ContributorType) => {
    navigate(`contribute/${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">PGV Contribution Hub</h1>
            <p className="text-xl text-muted-foreground">
              Share your golf journey, insights, and expertise with the Parlay Golf Ventures community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contributorTypes.map((contributor) => (
              <Card key={contributor.type} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="text-4xl mb-2">{contributor.icon}</div>
                  <CardTitle>{contributor.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{contributor.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleContributorSelect(contributor.type)}
                  >
                    Continue as {contributor.title}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Why Contribute?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="text-xl font-medium mb-2">Share Your Journey</h3>
                <p>Help others learn from your experiences and challenges in golf</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="text-xl font-medium mb-2">Build Community</h3>
                <p>Connect with like-minded golfers and grow the PGV community</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="text-xl font-medium mb-2">Get Recognition</h3>
                <p>Showcase your expertise and gain visibility in the golf community</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContributionLandingPage;