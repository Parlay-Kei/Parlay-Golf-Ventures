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

const contentCreatorSchema = baseContributionSchema.extend({
  contentType: z.enum(['edited-clip', 'commentary', 'gear-review', 'community-highlight']),
  videoUrl: z.string().url('Please enter a valid video URL').optional(),
  gearBrand: z.string().optional(),
  gearModel: z.string().optional(),
  gearType: z.enum(['driver', 'iron', 'wedge', 'putter', 'ball', 'accessory']).optional(),
  rating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  featuredCommunityMember: z.string().optional(),
  highlightType: z.enum(['achievement', 'improvement', 'community', 'other']).optional(),
});

type ContentCreatorFormData = z.infer<typeof contentCreatorSchema>;

interface ContentCreatorFormProps {
  onSubmit: (data: ContentCreatorFormData) => void;
  defaultValues?: Partial<ContentCreatorFormData>;
  communityMembers?: Array<{ id: string; name: string }>;
}

export const ContentCreatorForm: React.FC<ContentCreatorFormProps> = ({
  onSubmit,
  defaultValues,
  communityMembers = [],
}) => {
  const form = useForm<ContentCreatorFormData>({
    resolver: zodResolver(contentCreatorSchema),
    defaultValues: {
      contentType: 'edited-clip',
      rating: 3,
      ...defaultValues,
    },
  });

  const contentType = form.watch('contentType');

  return (
    <BaseContributionForm
      onSubmit={onSubmit}
      defaultValues={defaultValues}
    >
      <FormField
        control={form.control}
        name="contentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Content</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edited-clip" id="edited-clip" />
                  <Label htmlFor="edited-clip">Edited Clip</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="commentary" id="commentary" />
                  <Label htmlFor="commentary">Commentary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gear-review" id="gear-review" />
                  <Label htmlFor="gear-review">Gear Review</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="community-highlight" id="community-highlight" />
                  <Label htmlFor="community-highlight">Community Highlight</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(contentType === 'edited-clip' || contentType === 'commentary') && (
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

      {contentType === 'gear-review' && (
        <>
          <FormField
            control={form.control}
            name="gearBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gear Brand</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Titleist, Callaway, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gearModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gear Model</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Pro V1, Mavrik, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gearType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gear Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gear type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="iron">Iron</SelectItem>
                    <SelectItem value="wedge">Wedge</SelectItem>
                    <SelectItem value="putter">Putter</SelectItem>
                    <SelectItem value="ball">Ball</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (1-5)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {contentType === 'community-highlight' && (
        <>
          <FormField
            control={form.control}
            name="featuredCommunityMember"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Community Member</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a community member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {communityMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
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
            name="highlightType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Highlight Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select highlight type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </BaseContributionForm>
  );
};
