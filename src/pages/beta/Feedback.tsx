/**
 * Beta Feedback Page
 * 
 * This page allows beta users to provide feedback about their experience
 * with the Parlay Golf Ventures platform.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { handleApiError } from '@/lib/utils/errorHandler';
import { BetaFeedbackForm } from '@/components/beta/BetaFeedbackForm';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function BetaFeedbackPage() {
  const { user } = useAuth();
  const [hasFeedback, setHasFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user has already provided feedback
  useEffect(() => {
    const checkFeedback = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Check if the user has already provided feedback
        const { data, error } = await supabase
          .from('beta_users')
          .select('feedback_provided')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        setHasFeedback(data?.feedback_provided || false);
      } catch (error) {
        handleApiError(error, 'Failed to check feedback status', false);
      } finally {
        setLoading(false);
      }
    };
    
    checkFeedback();
  }, [user]);

  const handleFeedbackSubmitted = () => {
    setHasFeedback(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Beta Feedback</h1>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : hasFeedback ? (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-center">Thank You for Your Feedback!</CardTitle>
              <CardDescription className="text-center">
                We appreciate your input and will use it to improve the Parlay Golf Ventures platform.
                Your feedback is invaluable to us as we work to create the best possible experience for our users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="mb-4">
                  If you have any additional thoughts or encounter new issues, please don't hesitate to reach out to us directly at <a href="mailto:feedback@parlaygolfventures.com" className="text-pgv-green hover:underline">feedback@parlaygolfventures.com</a>.
                </p>
                <p>
                  Thank you for being part of our beta testing community!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <BetaFeedbackForm onSubmitSuccess={handleFeedbackSubmitted} />
        )}
      </div>
    </MainLayout>
  );
}
