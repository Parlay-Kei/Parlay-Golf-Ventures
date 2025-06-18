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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    videoLink: '',
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    state: '',
    phone: '',
    description: '',
    consent: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNext = (e) => {
    e?.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleBack = (e) => {
    e?.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Your swing video has been submitted! We'll review it shortly.");
      setStep(1);
      setForm({
        videoLink: '',
        firstName: '',
        lastName: '',
        email: '',
        city: '',
        state: '',
        phone: '',
        description: '',
        consent: false,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
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
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <form onSubmit={step === 4 ? handleSubmit : handleNext}>
              <div className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl font-bold text-gray-900">Swing Video</h2>
                    <Label htmlFor="videoLink">Video Link</Label>
                    <Input
                      id="videoLink"
                      placeholder="YouTube, Vimeo, or other video link"
                      value={form.videoLink}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Please provide a link to your swing video (YouTube, Vimeo, Instagram, etc.)
                    </p>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl font-bold text-gray-900">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={form.firstName} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={form.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={form.city} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" value={form.state} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input id="phone" value={form.phone} onChange={handleChange} />
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl font-bold text-gray-900">About Your Golf Journey</h2>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your golf experience, goals, and any challenges you've faced..."
                      rows={4}
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl font-bold text-gray-900">Consent</h2>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="consent" checked={form.consent} onChange={handleChange} required />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="consent" className="text-sm font-medium leading-none">
                          I consent to Parlay Golf Ventures using my submitted content
                        </Label>
                        <p className="text-sm text-gray-500">
                          By checking this box, you agree that we may use your submitted videos and information
                          for promotional purposes and talent identification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {step < 4 && (
                    <Button type="submit" className="ml-auto">
                      Next
                    </Button>
                  )}
                  {step === 4 && (
                    <Button
                      type="submit"
                      className="w-full bg-pgv-green hover:bg-pgv-green/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Your Swing"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
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
