/**
 * Beta Signup Form Component
 * 
 * This component allows visitors to request beta access by submitting their email address.
 * It will be displayed on the homepage when the platform is in beta mode.
 */

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { handleApiError } from '@/lib/utils/errorHandler';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof formSchema>;

export function BetaSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Check if this email is already in the beta_requests table
      const { data: existingRequest, error: checkError } = await supabase
        .from('beta_requests')
        .select('id')
        .eq('email', values.email)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // If the email already exists, just show success message
      if (existingRequest) {
        setIsSuccess(true);
        toast.success('Your request has been received!');
        return;
      }
      
      // Otherwise, insert a new request
      const { error } = await supabase
        .from('beta_requests')
        .insert({
          email: values.email,
          requested_at: new Date().toISOString(),
          status: 'pending'
        });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success('Thanks for your interest! We\'ll be in touch soon.');
    } catch (error) {
      handleApiError(error, 'Failed to submit beta request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-2">Request Received!</h3>
        <p className="text-blue-700">
          Thank you for your interest in Parlay Golf Ventures. We'll review your request and send an invite code to your email soon.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
      <h3 className="text-xl font-bold text-blue-800 mb-2">Request Beta Access</h3>
      <p className="text-blue-700 mb-4">
        Join our exclusive beta program and be among the first to experience Parlay Golf Ventures.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Enter your email address" 
                      {...field} 
                      className="h-12 bg-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Request Access <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
