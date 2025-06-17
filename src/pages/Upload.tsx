import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { FeatureGate } from "@/components/FeatureGate";
import { FEATURES } from "@/lib/features";
import withErrorBoundary from '@/components/withErrorBoundary';

const Upload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Your swing video has been submitted! We'll review it shortly.");
      
      // Reset form (in a real app, we'd use form state)
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-pgv-green py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Upload Your Swing
            </h1>
            <p className="text-white/90 max-w-2xl mx-auto">
              Share your golf swing with us and get noticed by our network of coaches and scouts.
              This could be your first step toward new opportunities in golf.
            </p>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Your city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="Your state" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" placeholder="(123) 456-7890" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Swing Video</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoLink">Video Link</Label>
                    <Input 
                      id="videoLink" 
                      placeholder="YouTube, Vimeo, or other video link" 
                      required 
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Please provide a link to your swing video (YouTube, Vimeo, Instagram, etc.)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">About Your Golf Journey</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Tell us about your golf experience, goals, and any challenges you've faced..." 
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="consent" required />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="consent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I consent to Parlay Golf Ventures using my submitted content
                    </Label>
                    <p className="text-sm text-gray-500">
                      By checking this box, you agree that we may use your submitted videos and information
                      for promotional purposes and talent identification.
                    </p>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-pgv-green hover:bg-pgv-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Your Swing"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Analysis section - only for Aspiring and Breakthrough tiers */}
        <FeatureGate feature="AI_ANALYSIS">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">AI Analysis</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Add your AI analysis features here */}
            </div>
          </section>
        </FeatureGate>
      </main>
      
      <Footer />
    </div>
  );
};

export default withErrorBoundary(Upload, 'upload');
