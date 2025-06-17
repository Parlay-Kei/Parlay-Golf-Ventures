import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import withErrorBoundary from '@/components/withErrorBoundary';

export default withErrorBoundary(function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if we have a verification token in the URL
        const hash = window.location.hash;
        
        if (!hash || !hash.includes('type=signup')) {
          setVerificationStatus('error');
          return;
        }

        // Get current auth state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          setEmail(session.user.email || '');
          
          // Check if email is verified
          if (session.user.email_confirmed_at) {
            setVerificationStatus('success');
            toast({
              title: "Email verified",
              description: "Your email has been successfully verified.",
            });
            
            // Clear the hash from the URL
            window.history.replaceState(null, "", window.location.pathname);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              const returnTo = new URLSearchParams(location.search).get('return_to');
              navigate(returnTo || '/dashboard');
            }, 3000);
          } else {
            setVerificationStatus('error');
            toast({
              title: "Verification pending",
              description: "Your email verification is still pending. Please check your inbox.",
              variant: "destructive",
            });
          }
        } else {
          setVerificationStatus('error');
          toast({
            title: "Verification failed",
            description: "Unable to verify your email. Please try again or contact support.",
            variant: "destructive",
          });
        }
      } catch (error: unknown) {
        console.error("Email verification error:", error);
        setVerificationStatus('error');
        const errorMessage = error instanceof Error ? error.message : "Failed to verify email. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    handleEmailVerification();
  }, [navigate, location.search]);

  const resendVerificationEmail = async () => {
    try {
      if (!email) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        } else {
          throw new Error("No email found for verification");
        }
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: unknown) {
      console.error("Resend verification error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to resend verification email. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              {verificationStatus === 'loading' 
                ? 'Verifying your email address...'
                : verificationStatus === 'success'
                  ? 'Your email has been verified!'
                  : 'Email verification required'}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            {verificationStatus === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-pgv-green mb-4" />
                <p>Verifying your email address...</p>
              </div>
            ) : verificationStatus === 'success' ? (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 justify-center">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Email successfully verified!</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to the dashboard in a moment...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">Your email is not verified</p>
                    <p className="text-sm mt-1">
                      Please check your inbox for the verification link. If you didn't receive it, you can request a new one.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={resendVerificationEmail}
                  className="w-full bg-pgv-green hover:bg-pgv-green/90"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4">
            {verificationStatus !== 'loading' && (
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}, 'verify-email');
