
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DatePickerField } from "./DatePickerField";
import { TimePickerField } from "./TimePickerField";
import { CourseSelectField } from "./CourseSelectField";
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
  course: z.string().min(1, "Please select a course"),
  notes: z.string().optional(),
});

export type ReviewFormValues = z.infer<typeof formSchema>;

export const ReviewRequestForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      time: "",
      course: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Form data that would be sent to backend:", {
        ...data,
        id: Date.now(),
        submittedAt: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Request submitted",
        description: "We'll contact you soon to confirm your mentor session.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Your request couldn't be submitted. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextField 
          control={form.control}
          name="name"
          label="Your Name"
          placeholder="John Doe"
        />

        <TextField 
          control={form.control}
          name="email"
          label="Email Address" 
          placeholder="john@example.com"
          type="email"
        />

        <DatePickerField 
          control={form.control}
          name="date"
        />

        <TimePickerField 
          control={form.control}
          name="time"
        />

        <CourseSelectField 
          control={form.control}
          name="course"
        />

        <TextareaField 
          control={form.control}
          name="notes"
          label="What would you like feedback on?"
          placeholder="Mention drills, problems, or recent rounds..."
        />

        <Button 
          type="submit" 
          className="w-full bg-pgv-green hover:bg-pgv-green/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
};
