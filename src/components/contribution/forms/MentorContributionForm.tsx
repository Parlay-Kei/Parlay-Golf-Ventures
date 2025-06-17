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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mentorContributionSchema = baseContributionSchema.extend({
  contributionType: z.enum(['swing-breakdown', 'ai-tutorial']),
  targetSwingId: z.string().optional(),
  videoUrl: z.string().url('Please enter a valid video URL').optional(),
  analysisType: z.enum(['technical', 'conceptual', 'both']).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  keyPoints: z.array(z.string()).optional(),
  aiModel: z.string().optional(),
  promptUsed: z.string().optional(),
});

type MentorContributionFormData = z.infer<typeof mentorContributionSchema>;

interface MentorContributionFormProps {
  onSubmit: (data: MentorContributionFormData) => void;
  defaultValues?: Partial<MentorContributionFormData>;
  availableSwings?: Array<{ id: string; title: string }>;
}

export const MentorContributionForm: React.FC<MentorContributionFormProps> = ({
  onSubmit,
  defaultValues,
  availableSwings = [],
}) => {
  const form = useForm<MentorContributionFormData>({
    resolver: zodResolver(mentorContributionSchema),
    defaultValues: {
      contributionType: 'swing-breakdown',
      analysisType: 'both',
      difficultyLevel: 'intermediate',
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
                  <RadioGroupItem value="swing-breakdown" id="swing-breakdown" />
                  <Label htmlFor="swing-breakdown">Swing Breakdown</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai-tutorial" id="ai-tutorial" />
                  <Label htmlFor="ai-tutorial">AI Tutorial Response</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {contributionType === 'swing-breakdown' && (
        <>
          <FormField
            control={form.control}
            name="targetSwingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Swing to Breakdown</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a swing" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableSwings.map((swing) => (
                      <SelectItem key={swing.id} value={swing.id}>
                        {swing.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="analysisType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Analysis Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical">Technical</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conceptual" id="conceptual" />
                      <Label htmlFor="conceptual">Conceptual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Both</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Difficulty Level</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {contributionType === 'ai-tutorial' && (
        <>
          <FormField
            control={form.control}
            name="aiModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Model Used</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., GPT-4, Claude, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="promptUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt Used</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the prompt you used to generate the tutorial"
                    className="min-h-[100px]"
                    {...field}
                  />
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