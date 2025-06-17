import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { createCheckoutSession } from "@/api/stripe-checkout"
import withErrorBoundary from '@/components/withErrorBoundary'

type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough'

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  tier: SubscriptionTier
  highlight?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for those who want to try out our platform",
    tier: "free",
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
    features: [
      "Everything in Driven, plus:",
      "Advanced swing analysis",
      "Weekly practice plans",
      "1 virtual coaching session/month",
      "Priority support",
      "Course strategy guides"
    ]
  },
  {
    name: "Breakthrough",
    price: "$199",
    description: "For serious golfers aiming for excellence",
    tier: "breakthrough",
    features: [
      "Everything in Aspiring, plus:",
      "Professional swing analysis",
      "Daily practice plans",
      "4 virtual coaching sessions/month",
      "24/7 priority support",
      "Custom tournament prep plans",
      "Mental game coaching"
    ]
  }
]

export default withErrorBoundary(function Subscription() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<SubscriptionTier | null>(null)

  const handleSubscribe = async (tier: SubscriptionTier) => {
    try {
      setLoading(tier)
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!user) {
        // If not logged in, redirect to sign up with return URL
        navigate('/signup?return_to=/subscription')
        return
      }

      // Check if user already has a subscription
      const { data: existingSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subError && subError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw subError
      }

      if (existingSubscription) {
        // If user is upgrading from free to paid tier, allow it
        if (existingSubscription.tier === 'free' && tier !== 'free') {
          // Continue with upgrade process
        } else {
          toast({
            title: "Subscription exists",
            description: "You already have an active subscription. Please manage it from your dashboard.",
            variant: "destructive"
          })
          return
        }
      }

      // For free tier, skip payment processing
      if (tier === 'free') {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              tier: tier,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: null, // No end date for free tier
            }
          ])

        if (insertError) throw insertError

        toast({
          title: "Free membership activated!",
          description: "Welcome to PGV Academy! You now have access to our basic features."
        })

        // Redirect to dashboard
        navigate('/dashboard')
        return
      }

      // For paid tiers, create a Stripe checkout session
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !userData.user.email) {
        throw new Error('User email not found');
      }
      
      // Create checkout session and redirect to Stripe
      const { url } = await createCheckoutSession(user.id, tier, userData.user.email);
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Error",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Path to Golf Excellence</h1>
          <p className="text-xl text-muted-foreground">
            Select the membership tier that best fits your golfing journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.tier}
              className={`relative ${tier.highlight ? 'border-pgv-green shadow-lg scale-105' : ''}`}
            >
              {tier.highlight && (
                <Badge 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 bg-pgv-green"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-pgv-green" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${tier.tier === 'free' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-pgv-green hover:bg-pgv-green/90'}`}
                  onClick={() => handleSubscribe(tier.tier)}
                  disabled={loading !== null}
                >
                  {loading === tier.tier ? "Processing..." : tier.tier === 'free' ? "Sign Up Free" : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}, 'subscription')