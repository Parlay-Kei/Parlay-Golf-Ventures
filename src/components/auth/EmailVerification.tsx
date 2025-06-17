import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { emailVerificationApi } from '@/lib/auth/email-verification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function EmailVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const result = await emailVerificationApi.checkVerificationStatus();
      if (result.success) {
        setIsVerified(result.isVerified);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const result = await emailVerificationApi.sendVerificationEmail();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Verification email sent successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Your email has been verified successfully.</p>
          <Button
            className="w-full mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-4">
          Please check your email for a verification link. If you haven't received
          it, you can request a new one.
        </p>
        <Button
          className="w-full"
          onClick={handleResendVerification}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </CardContent>
    </Card>
  );
} 