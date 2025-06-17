import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import withErrorBoundary from '@/components/withErrorBoundary';

export default withErrorBoundary(function CommunitySignUp() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    goals: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create the user account with authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10),
        options: {
          data: {
            name: formData.name,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('User created successfully:', authData.user.id);

      // Then add the user to the academy_users table
      const { error: dbError } = await supabase
        .from('academy_users')
        .insert([
          {
            user_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            skill_level: 'beginner', // Default for free tier
            goals: formData.goals,
            learning_style: 'self-paced', // Default for free tier
            status: 'active', // Active status for free tier
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('User added to academy_users successfully');

      // Create a subscription record for the free tier
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: authData.user.id,
            tier: 'free',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Free subscriptions don't expire
            cancel_at_period_end: false
          }
        ]);

      if (subError) {
        console.error('Subscription error:', subError);
        throw subError;
      }

      console.log('Subscription created successfully');

      toast({
        title: "Welcome to PGV!",
        description: "You are officially part of the movement. Welcome to PGV!",
      });

      // Redirect to dashboard after successful signup
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error:', error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gradient-to-b from-pgv-green to-pgv-green-dark">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto bg-pgv-green-dark border-pgv-gold">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-pgv-gold">Join the PGV Movement</CardTitle>
              <CardDescription className="text-pgv-white">
                Sign up for our free tier and become part of the Parlay Golf Ventures community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-pgv-gold font-medium">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-pgv-white text-pgv-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-pgv-gold font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-pgv-white text-pgv-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-pgv-gold font-medium">City / State</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="bg-pgv-white text-pgv-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-pgv-gold font-medium">What are your golf goals?</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    rows={4}
                    value={formData.goals}
                    onChange={handleChange}
                    className="bg-pgv-white text-pgv-black"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-pgv-gold hover:bg-pgv-gold-dark text-pgv-green font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Join the Movement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}, 'community-signup');
