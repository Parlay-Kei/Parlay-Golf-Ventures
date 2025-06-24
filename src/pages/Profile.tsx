import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatures } from "@/lib/features";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Lock, Mail, Upload, Save, Check, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import withErrorBoundary from '@/components/withErrorBoundary';

// Form validation schemas
const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

interface ProfileData {
  id: string;
  full_name: string;
  username: string;
  email: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default withErrorBoundary(function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userTier } = useFeatures();
  
  // State for profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // State for form fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  // State for avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Form errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        navigate("/login");
        return;
      }
      
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user, navigate]);
  
  // Handle avatar file selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    setAvatarFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
    
    // Clean up the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Upload avatar to storage
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    setUploadingAvatar(true);
    
    try {
      const supabase = await getSupabase();
      // Generate a unique filename
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
      setAvatarFile(null);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // Save profile changes
  const saveProfile = async () => {
    try {
      const supabase = await getSupabase();
      // Validate form data
      const result = profileSchema.safeParse({
        full_name: fullName,
        username,
        bio
      });
      
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          formattedErrors[err.path[0]] = err.message;
        });
        setProfileErrors(formattedErrors);
        return;
      }
      
      setProfileErrors({});
      setSaving(true);
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username,
          bio
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Change password
  const changePassword = async () => {
    try {
      const supabase = await getSupabase();
      // Validate form data
      const result = passwordSchema.safeParse({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          formattedErrors[err.path[0]] = err.message;
        });
        setPasswordErrors(formattedErrors);
        return;
      }
      
      setPasswordErrors({});
      setChangingPassword(true);
      
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword
      });
      
      if (signInError) {
        setPasswordErrors({
          currentPassword: "Current password is incorrect"
        });
        setChangingPassword(false);
        return;
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Update Failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Get the appropriate badge for the user's tier
  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;
    
    switch (tier) {
      case "free":
        return <Badge className="bg-blue-500">Free</Badge>;
      case "driven":
        return <Badge className="bg-purple-500">Driven</Badge>;
      case "aspiring":
        return <Badge className="bg-pgv-green">Aspiring</Badge>;
      case "breakthrough":
        return <Badge className="bg-pgv-gold text-pgv-green">Breakthrough</Badge>;
      default:
        return null;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pgv-green mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground mb-6">Manage your account information and preferences</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                      <AvatarFallback className="text-2xl">
                        {fullName ? fullName.charAt(0).toUpperCase() : <User />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-xl font-semibold mb-1">{fullName || "Your Name"}</h2>
                    <p className="text-muted-foreground mb-2">{user?.email}</p>
                    
                    {getTierBadge(userTier)}
                    
                    <div className="w-full mt-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Member since</span>
                        <span>{profile?.created_at ? formatDate(profile.created_at) : ""}</span>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <Button 
                        variant="outline" 
                        className="w-full mb-2"
                        onClick={() => navigate("/subscription-new")}
                      >
                        Manage Subscription
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => signOut()}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                
                <CardContent>
                  <TabsContent value="profile" className="space-y-6">
                    {/* Profile Information Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                        />
                        {profileErrors.full_name && (
                          <p className="text-destructive text-sm">{profileErrors.full_name}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Your username"
                        />
                        {profileErrors.username && (
                          <p className="text-destructive text-sm">{profileErrors.username}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="pr-10"
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself"
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {profileErrors.bio && (
                          <p className="text-destructive text-sm">{profileErrors.bio}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
                      </div>
                      
                      <Button 
                        onClick={saveProfile} 
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    {/* Avatar Upload */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                          <AvatarFallback className="text-xl">
                            {fullName ? fullName.charAt(0).toUpperCase() : <User />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <Label htmlFor="avatar" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary underline">
                              <Upload className="h-4 w-4" />
                              Choose a new photo
                            </div>
                          </Label>
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground">JPG, PNG or GIF. 2MB max.</p>
                        </div>
                      </div>
                      
                      {avatarFile && (
                        <Button
                          onClick={uploadAvatar}
                          disabled={uploadingAvatar}
                          className="mt-4"
                          size="sm"
                        >
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Upload New Avatar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-6">
                    {/* Password Change Form */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pr-10"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="text-destructive text-sm">{passwordErrors.currentPassword}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          {passwordErrors.newPassword && (
                            <p className="text-destructive text-sm">{passwordErrors.newPassword}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="text-destructive text-sm">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-700 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Password requirements:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>At least 8 characters</li>
                              <li>At least one uppercase letter</li>
                              <li>At least one lowercase letter</li>
                              <li>At least one number</li>
                            </ul>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={changePassword} 
                          disabled={changingPassword}
                          className="w-full"
                        >
                          {changingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Account Security */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                          </div>
                          <Button variant="outline" disabled>
                            Coming Soon
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Login History</p>
                            <p className="text-sm text-muted-foreground">View your recent login activity</p>
                          </div>
                          <Button variant="outline" disabled>
                            Coming Soon
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}, 'profile');
