/**
 * Beta Feedback Form Component
 * 
 * This component allows beta users to provide feedback about their experience.
 * It collects structured feedback and sends it to the database.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { handleApiError } from '@/lib/utils/errorHandler';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const feedbackSchema = z.object({
  overallExperience: z.enum(['excellent', 'good', 'average', 'poor', 'terrible']),
  usability: z.enum(['excellent', 'good', 'average', 'poor', 'terrible']),
  featuresMissing: z.string().optional(),
  bugReport: z.string().optional(),
  improvementSuggestions: z.string().optional(),
  likedMost: z.string().optional(),
  likedLeast: z.string().optional(),
  willRecommend: z.enum(['definitely', 'probably', 'maybe', 'unlikely', 'no']),
  additionalComments: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface BetaFeedbackFormProps {
  onSubmitSuccess?: () => void;
}

export function BetaFeedbackForm({ onSubmitSuccess }: BetaFeedbackFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overallExperience: 'good',
      usability: 'good',
      willRecommend: 'probably',
    },
  });

  const onSubmit = async (values: FeedbackFormValues) => {
    if (!user) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save feedback to the database
      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          user_id: user.id,
          overall_experience: values.overallExperience,
          usability: values.usability,
          features_missing: values.featuresMissing || null,
          bug_report: values.bugReport || null,
          improvement_suggestions: values.improvementSuggestions || null,
          liked_most: values.likedMost || null,
          liked_least: values.likedLeast || null,
          will_recommend: values.willRecommend,
          additional_comments: values.additionalComments || null,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update the beta_users table to mark that feedback has been provided
      await supabase
        .from('beta_users')
        .update({ feedback_provided: true })
        .eq('user_id', user.id);

      toast.success('Thank you for your feedback!');
      form.reset();
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      handleApiError(error, 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Beta Feedback</CardTitle>
        <CardDescription>
          Your feedback is invaluable in helping us improve Parlay Golf Ventures.
          Please share your thoughts and experiences with the beta version.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Experience */}
              <FormField
                control={form.control}
                name="overallExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Experience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="terrible">Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usability */}
              <FormField
                control={form.control}
                name="usability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ease of Use</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="terrible">Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Features Missing */}
            <FormField
              control={form.control}
              name="featuresMissing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What features do you think are missing?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe any features you'd like to see added"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bug Report */}
            <FormField
              control={form.control}
              name="bugReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Did you encounter any bugs or issues?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe any bugs or issues you encountered"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Improvement Suggestions */}
            <FormField
              control={form.control}
              name="improvementSuggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have any suggestions for improvement?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please share your ideas for how we can improve"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liked Most */}
              <FormField
                control={form.control}
                name="likedMost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What did you like most about the platform?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please share what you enjoyed"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Liked Least */}
              <FormField
                control={form.control}
                name="likedLeast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What did you like least about the platform?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please share what you didn't enjoy"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Will Recommend */}
            <FormField
              control={form.control}
              name="willRecommend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How likely are you to recommend Parlay Golf Ventures to others?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select likelihood" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="definitely">Definitely will recommend</SelectItem>
                      <SelectItem value="probably">Probably will recommend</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="unlikely">Unlikely to recommend</SelectItem>
                      <SelectItem value="no">Will not recommend</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Comments */}
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any additional comments or feedback?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please share any other thoughts you have"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-pgv-green hover:bg-pgv-green/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        Your feedback helps us build a better platform for all golf enthusiasts.
      </CardFooter>
    </Card>
  );
}
