import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  location: z.string().optional(),
  about: z.string().min(10, "Please provide at least 10 characters about your interest in golf or PGV"),
})

export default function FreeMemberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
      about: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      const { data, error } = await supabase
        .from('academy_users')
        .insert([
          {
            name: values.name,
            email: values.email,
            location: values.location,
            about: values.about,
            tier: 'community_free',
            status: 'active',
            created_at: new Date().toISOString(),
          }
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      toast({
        title: "Welcome to PGV!",
        description: "You are now part of the PGV community. We're excited to have you!",
      })
      
      // Reset form after successful submission
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "There was an error submitting your sign-up. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-3xl font-cinzel text-pgv-gold">Join the PGV Movement</CardTitle>
        <CardDescription className="text-lg">
          Sign up for our free tier and become part of the Parlay Golf Ventures community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tell us about your interest in golf or PGV</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your golf journey and what interests you about PGV..."
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
              className="w-full bg-pgv-gold hover:bg-pgv-gold-dark text-pgv-green font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join the Movement"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 