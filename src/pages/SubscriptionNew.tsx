import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { createCheckoutSession } from "@/api/stripe-api";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import withErrorBoundary from '@/components/withErrorBoundary';

export type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  tier: SubscriptionTier;
  highlight?: boolean;
  color?: string;
  popular?: boolean;
}

interface FeatureComparison {
  name: string;
  description?: string;
  tiers: Record<SubscriptionTier, boolean | string>;
  category: 'content' | 'analysis' | 'coaching' | 'community' | 'support';
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for those who want to try out our platform",
    tier: "free",
    color: "bg-blue-500",
    features: [
      "Basic access to our platform",
      "Limited access to tutorials",
      "Community forum access"
    ]
  },
  {
    name: "Driven",
    price: "$49",
    description: "Perfect for getting started with golf fundamentals",
    tier: "driven",
    color: "bg-purple-500",
    features: [
      "Basic swing analysis",
      "Monthly practice plans",
      "Access to beginner tutorials",
      "Community forum access",
      "Email support"
    ]
  },
  {
    name: "Aspiring",
    price: "$99",
    description: "For golfers ready to take their game to the next level",
    tier: "aspiring",
    highlight: true,
    popular: true,
    color: "bg-pgv-green",
    features: [
      "Advanced swing analysis",
      "Weekly practice plans",
      "Access to all tutorials",
      "Community forum access",
      "Priority email support",
      "Monthly coaching session"
    ]
  },
  {
    name: "Breakthrough",
    price: "$199",
    description: "For serious players aiming for excellence",
    tier: "breakthrough",
    color: "bg-pgv-gold",
    features: [
      "Professional swing analysis",
      "Daily practice plans",
      "Weekly coaching sessions",
      "Tournament preparation",
      "24/7 priority support"
    ]
  }
];

// Detailed feature comparison for the comparison chart
const featureComparison: FeatureComparison[] = [
  // Content Access
  {
    name: "Basic Tutorials",
    description: "Fundamental golf techniques and drills",
    category: "content",
    tiers: { free: true, driven: true, aspiring: true, breakthrough: true }
  },
  {
    name: "Intermediate Tutorials",
    description: "More advanced techniques and strategies",
    category: "content",
    tiers: { free: false, driven: true, aspiring: true, breakthrough: true }
  },
  {
    name: "Advanced Tutorials",
    description: "Pro-level techniques and course management",
    category: "content",
    tiers: { free: false, driven: false, aspiring: true, breakthrough: true }
  },
  {
    name: "Premium Content",
    description: "Exclusive content from PGA professionals",
    category: "content",
    tiers: { free: false, driven: false, aspiring: "Limited", breakthrough: true }
  },
  
  // Swing Analysis
  {
    name: "Basic Swing Analysis",
    description: "Automated feedback on your swing",
    category: "analysis",
    tiers: { free: false, driven: true, aspiring: true, breakthrough: true }
  },
  {
    name: "Advanced Swing Analysis",
    description: "Detailed breakdown with improvement suggestions",
    category: "analysis",
    tiers: { free: false, driven: false, aspiring: true, breakthrough: true }
  },
  {
    name: "Professional Swing Analysis",
    description: "In-depth analysis from PGA teaching professionals",
    category: "analysis",
    tiers: { free: false, driven: false, aspiring: "1/month", breakthrough: "Unlimited" }
  },
  
  // Coaching
  {
    name: "Practice Plans",
    description: "Structured practice routines",
    category: "coaching",
    tiers: { free: false, driven: "Monthly", aspiring: "Weekly", breakthrough: "Daily" }
  },
  {
    name: "Coaching Sessions",
    description: "One-on-one virtual coaching",
    category: "coaching",
    tiers: { free: false, driven: false, aspiring: "Monthly", breakthrough: "Weekly" }
  },
  {
    name: "Tournament Preparation",
    description: "Specialized coaching for competitive play",
    category: "coaching",
    tiers: { free: false, driven: false, aspiring: false, breakthrough: true }
  },
  
  // Community
  {
    name: "Community Forum Access",
    description: "Connect with other golfers",
    category: "community",
    tiers: { free: true, driven: true, aspiring: true, breakthrough: true }
  },
  {
    name: "Private Groups",
    description: "Exclusive discussion groups by skill level",
    category: "community",
    tiers: { free: false, driven: true, aspiring: true, breakthrough: true }
  },
  
  // Support
  {
    name: "Customer Support",
    description: "Help with platform issues",
    category: "support",
    tiers: { free: "Email", driven: "Email", aspiring: "Priority Email", breakthrough: "24/7 Priority" }
  }
];

export default withErrorBoundary(function SubscriptionNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['content', 'analysis', 'coaching', 'community', 'support']);

  // Toggle category expansion in comparison view
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Navigate to community signup for free tier
  const goToCommunitySignup = () => {
    navigate('/join-community');
  };

  // Handle subscription checkout
  const handleSubscribe = async (tier: SubscriptionTier) => {
    // For free tier, navigate to community signup
    if (tier === 'free') {
      navigate('/join-community');
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      // Save the selected tier in session storage and redirect to login
      sessionStorage.setItem('selectedTier', tier);
      navigate('/login?return_to=/subscription-new');
      return;
    }
    
    try {
      setLoading(tier);
      
      // Create checkout session
      const { url, error } = await createCheckoutSession(tier);
      
      if (error) throw new Error(error);
      
      // Redirect to checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Checkout Error',
        description: 'There was a problem initiating checkout. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  // Get tier badge with appropriate color
  const getTierBadge = (tier: PricingTier) => {
    return (
      <Badge className={`${tier.color || 'bg-gray-500'}`}>
        {tier.name}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Membership</h1>
            <p className="text-muted-foreground">Select the plan that best fits your golfing journey</p>
          </div>
          
          {/* View toggle */}
          <div className="flex justify-center mb-8">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'comparison')} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cards">Pricing Cards</TabsTrigger>
                <TabsTrigger value="comparison">Feature Comparison</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Pricing Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.tier} 
                  className={`relative overflow-hidden ${tier.highlight ? 'border-pgv-green border-2 shadow-lg' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-pgv-green text-white px-3 py-1 text-xs font-bold uppercase transform translate-x-2 -translate-y-0 rotate-45 origin-bottom-left">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      {getTierBadge(tier)}
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-pgv-green mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => tier.tier === 'free' ? goToCommunitySignup() : handleSubscribe(tier.tier)}
                      className={`w-full ${tier.highlight ? 'bg-pgv-green hover:bg-pgv-green/90' : ''}`}
                      disabled={loading !== null}
                    >
                      {loading === tier.tier ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : tier.tier === 'free' ? 'Join Free' : 'Subscribe'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Feature Comparison View */}
          {viewMode === 'comparison' && (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="overflow-hidden rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          Feature
                        </th>
                        {pricingTiers.map((tier) => (
                          <th key={tier.tier} scope="col" className="px-6 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium">{tier.name}</span>
                              <span className="text-xs text-gray-500">{tier.price}/mo</span>
                              {tier.popular && (
                                <Badge className="mt-1 bg-pgv-green">Popular</Badge>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Group features by category */}
                      {['content', 'analysis', 'coaching', 'community', 'support'].map((category) => {
                        const categoryFeatures = featureComparison.filter(f => f.category === category);
                        const isExpanded = expandedCategories.includes(category);
                        
                        return (
                          <React.Fragment key={category}>
                            {/* Category Header */}
                            <tr className="bg-gray-50 cursor-pointer" onClick={() => toggleCategory(category)}>
                              <td colSpan={5} className="px-6 py-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-700 capitalize">{category}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  )}
                                </div>
                              </td>
                            </tr>
                            
                            {/* Category Features */}
                            {isExpanded && categoryFeatures.map((feature, idx) => (
                              <tr key={`${category}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4">
                                  <div className="flex items-start">
                                    <span className="font-medium">{feature.name}</span>
                                    {feature.description && (
                                      <div className="group relative ml-1">
                                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                                          {feature.description}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {pricingTiers.map((tier) => {
                                  const value = feature.tiers[tier.tier];
                                  return (
                                    <td key={`${feature.name}-${tier.tier}`} className="px-6 py-4 text-center">
                                      {value === true ? (
                                        <Check className="h-5 w-5 text-pgv-green mx-auto" />
                                      ) : value === false ? (
                                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                                      ) : (
                                        <span className="text-sm">{value}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center space-x-4">
                {pricingTiers.map((tier) => (
                  <Button 
                    key={tier.tier}
                    onClick={() => tier.tier === 'free' ? goToCommunitySignup() : handleSubscribe(tier.tier)}
                    className={tier.highlight ? 'bg-pgv-green hover:bg-pgv-green/90' : undefined}
                    disabled={loading !== null}
                  >
                    {loading === tier.tier ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : `Join ${tier.name}`}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Not sure which plan is right for you?</h2>
            <p className="text-muted-foreground mb-4">Start with our free tier and upgrade anytime as your skills progress.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/coming-soon')}
              className="mx-auto"
            >
              View Upcoming Features
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}, 'subscription-new');
