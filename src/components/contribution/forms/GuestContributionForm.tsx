import React from 'react';
import { BaseContributionForm, baseContributionSchema } from './BaseContributionForm';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const guestContributionSchema = baseContributionSchema.extend({
  contributionType: z.enum(['swing-demo', 'idea']),
  videoUrl: z.string().url('Please enter a valid video URL').optional(),
  category: z.string().optional(),
  impact: z.enum(['low', 'medium', 'high']).optional(),
});

type GuestContributionFormData = z.infer<typeof guestContributionSchema>;

interface GuestContributionFormProps {
  onSubmit: (data: GuestContributionFormData) => void;
  defaultValues?: Partial<GuestContributionFormData>;
}

export const GuestContributionForm: React.FC<GuestContributionFormProps> = ({
  onSubmit,
  defaultValues,
}) => {
  const form = useForm<GuestContributionFormData>({
    resolver: zodResolver(guestContributionSchema),
    defaultValues: {
      contributionType: 'swing-demo',
      ...defaultValues,
    },
  });

  const contributionType = form.watch('contributionType');

  return (
    <BaseContributionForm
      onSubmit={onSubmit}
      defaultValues={defaultValues}
    >
      <FormField
        control={form.control}
        name="contributionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Contribution</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="swing-demo" id="swing-demo" />
                  <Label htmlFor="swing-demo">Swing Demo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="idea" id="idea" />
                  <Label htmlFor="idea">Idea or Feature Request</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {contributionType === 'swing-demo' && (
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="Paste your video URL here"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {contributionType === 'idea' && (
        <>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Feature, Improvement, Bug Fix"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Impact</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </BaseContributionForm>
  );
}; 