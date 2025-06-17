import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BetaAccessForm } from "@/components/auth/BetaAccessForm"
import { betaService } from "@/lib/services/betaService"
import withErrorBoundary from '@/components/withErrorBoundary'

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  skillLevel: z.string().min(1, "Please select your skill level"),
  goals: z.string().optional(),
  learningStyle: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default withErrorBoundary(function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isBetaMode, setIsBetaMode] = useState(false);
  const [betaVerified, setBetaVerified] = useState(false);
  
  // Get the return URL from query params
  const returnTo = new URLSearchParams(location.search).get("return_to") || "/dashboard";
  
  // Check if beta mode is enabled
  useEffect(() => {
    setIsBetaMode(betaService.isBetaMode());
    
    // Check if a beta code was already verified in this session
    const storedCode = sessionStorage.getItem('betaInviteCode');
    if (storedCode) {
      setBetaVerified(true);
    }
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      skillLevel: "",
      goals: "",
      learningStyle: "",
      termsAccepted: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setUserEmail(values.email);
      
      // 1. Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
          emailRedirectTo: `${window.location.origin}/verify-email?return_to=${returnTo}`,
        },
      });

      if (authError) throw authError;
      
      if (!authData.user) throw new Error("Failed to create user account");
      
      // 2. Store additional user profile information
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: authData.user.id,
            full_name: values.fullName,
            email: values.email,
            skill_level: values.skillLevel,
            goals: values.goals || null,
            learning_style: values.learningStyle || null,
            created_at: new Date().toISOString(),
          }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Continue anyway since the auth account was created
      }
      
      // 3. If in beta mode, claim the invite code
      if (isBetaMode) {
        const inviteCode = sessionStorage.getItem('betaInviteCode');
        if (inviteCode) {
          await betaService.claimInviteCode(inviteCode, authData.user.id);
          // Clear the code from session storage
          sessionStorage.removeItem('betaInviteCode');
        }
      }

      setVerificationSent(true);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      // Handle specific error cases
      if (error instanceof Error && error.message.includes("User already registered")) {
        toast({
          title: "Email already registered",
          description: "This email is already associated with an account. Please log in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error instanceof Error ? error.message : "There was an error creating your account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const resendVerificationEmail = async () => {
    try {
      if (!userEmail) {
        throw new Error("Email address is required");
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email?return_to=${returnTo}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: unknown) {
      console.error("Resend verification error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive",
      });
    }
  };

  // If beta mode is enabled and not verified, show the beta access form
  if (isBetaMode && !betaVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <BetaAccessForm 
              onVerified={() => setBetaVerified(true)}
              onCancel={() => navigate('/')}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Join PGV Academy to access courses, community, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationSent ? (
                <div className="space-y-4">
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Verification Email Sent!</h3>
                    <p className="mb-2">
                      We've sent a verification link to <span className="font-medium">{userEmail}</span>.
                      Please check your email and click the link to verify your account.
                    </p>
                    <p className="text-sm">
                      If you don't see the email, check your spam folder or click below to resend.
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={resendVerificationEmail}
                      variant="outline"
                      className="w-full"
                    >
                      Resend Verification Email
                    </Button>
                    
                    <Button 
                      onClick={() => navigate("/login")}
                      className="w-full bg-pgv-green hover:bg-pgv-green/90"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="John Doe" 
                                className="pl-10"
                                disabled={isSubmitting}
                                {...field} 
                              />
                            </div>
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                className="pl-10"
                                disabled={isSubmitting}
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10"
                                  disabled={isSubmitting}
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10"
                                  disabled={isSubmitting}
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="skillLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Skill Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your skill level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner (Just starting out)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (Regular player)</SelectItem>
                              <SelectItem value="advanced">Advanced (Competitive player)</SelectItem>
                              <SelectItem value="expert">Expert (Tournament player)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Goals (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your golf journey and what you hope to achieve..." 
                              className="min-h-[80px]"
                              disabled={isSubmitting}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="learningStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Learning Style (Optional)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preferred learning style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="visual">Visual (Video demonstrations)</SelectItem>
                              <SelectItem value="practical">Practical (Hands-on practice)</SelectItem>
                              <SelectItem value="analytical">Analytical (Detailed explanations)</SelectItem>
                              <SelectItem value="social">Social (Group learning)</SelectItem>
                              <SelectItem value="mixed">Mixed (Combination of styles)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the <Link to="/terms" className="text-pgv-green hover:underline">terms and conditions</Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-pgv-green hover:bg-pgv-green/90" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-pgv-green hover:underline font-medium">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}, 'signup');