import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessionManager } from '@/lib/auth/session-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface SessionData {
  user: {
    email: string;
    last_sign_in_at: string;
  };
}

export function SessionManager() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const result = await sessionManager.getCurrentSession();
      if (result.success) {
        setSession(result.session);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    setIsLoading(true);
    try {
      const result = await sessionManager.refreshSession();
      if (result.success) {
        setSession(result.session);
        toast({
          title: 'Success',
          description: 'Session refreshed successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh session.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const result = await sessionManager.signOut();
      if (result.success) {
        router.push('/auth/login');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex justify-center items-center h-32">
          <p>Loading session...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Active Session</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            You are not currently signed in.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push('/auth/login')}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Last Active:</strong>{' '}
            {new Date(session.user.last_sign_in_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleRefreshSession}
            disabled={isLoading}
          >
            Refresh Session
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 