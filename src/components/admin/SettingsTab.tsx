import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save, Upload, Key, Shield, Bell, Globe, Palette, Rocket } from 'lucide-react';
import { betaService } from '@/lib/services/betaService';
import BetaModeToggle from './BetaModeToggle';

export default function SettingsTab() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileSettings, setProfileSettings] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || '',
    role: 'admin',
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotificationsEnabled: true,
    sessionTimeout: '30',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newSignupNotifications: true,
    contentSubmissionNotifications: true,
    systemAlerts: true,
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    accentColor: 'green',
    sidebarCollapsed: false,
    denseMode: false,
  });
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Parlay Golf Ventures',
    contactEmail: 'admin@parlayventures.com',
    supportPhone: '(555) 123-4567',
    timezone: 'America/Los_Angeles',
  });
  const [platformSettings, setPlatformSettings] = useState({
    betaMode: false,
    requireInvites: true,
    enableFeedback: true,
    maintenanceMode: false,
  });

  // Load current beta status on component mount
  useEffect(() => {
    const isBetaMode = betaService.getCurrentBetaStatus();
    setPlatformSettings(prev => ({
      ...prev,
      betaMode: isBetaMode
    }));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // In a real application, you would update the user profile in your database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Security Settings Updated',
        description: 'Your security settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save security settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Notification Settings Updated',
        description: 'Your notification preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Appearance Settings Updated',
        description: 'Your appearance preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save appearance settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'General Settings Updated',
        description: 'Your general settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save general settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Toggle beta mode
      const success = await betaService.toggleBetaMode(platformSettings.betaMode);
      
      if (!success) {
        throw new Error('Failed to toggle beta mode');
      }
      
      // If beta mode is being turned off, show a more prominent message
      if (!platformSettings.betaMode) {
        toast({
          title: '🚀 Platform Going Live!',
          description: 'Beta mode has been disabled. The platform is now in production mode.',
        });
      } else {
        toast({
          title: 'Platform Settings Updated',
          description: 'Your platform settings have been saved successfully.',
        });
      }
      
      // Force refresh to apply changes
      if (!platformSettings.betaMode) {
        // In a real implementation, this might trigger additional actions
        // such as disabling beta-only features, updating database settings, etc.
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving platform settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save platform settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 mb-6">
          <div className="bg-white rounded-lg shadow p-1 flex-grow">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="profile">
                <div className="flex items-center">Profile</div>
              </TabsTrigger>
              <TabsTrigger value="security">
                <div className="flex items-center">Security</div>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <div className="flex items-center">Notifications</div>
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <div className="flex items-center">Appearance</div>
              </TabsTrigger>
              <TabsTrigger value="general">
                <div className="flex items-center">General</div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="bg-white rounded-lg shadow p-1">
            <Button 
              onClick={() => setActiveTab('platform')}
              className={`w-full rounded-md flex items-center justify-center ${activeTab === 'platform' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Platform
            </Button>
          </div>
        </div>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileSettings.name} 
                    onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})} 
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileSettings.email} 
                    onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})} 
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                      {profileSettings.avatar ? (
                        <img src={profileSettings.avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          {profileSettings.name.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profileSettings.role} disabled />
                  <p className="text-xs text-gray-500">Your role cannot be changed from this interface.</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveSecurity}>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch 
                      checked={securitySettings.twoFactorEnabled} 
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorEnabled: checked})} 
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="button" variant="outline" className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select 
                      value={securitySettings.sessionTimeout} 
                      onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
                    >
                      <SelectTrigger id="sessionTimeout">
                        <SelectValue placeholder="Select timeout duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Email Notifications for Login Attempts</Label>
                      <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                    </div>
                    <Switch 
                      checked={securitySettings.emailNotificationsEnabled} 
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, emailNotificationsEnabled: checked})} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveNotifications}>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications in your browser</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})} 
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newSignups">New Sign-ups</Label>
                        <Switch 
                          id="newSignups"
                          checked={notificationSettings.newSignupNotifications} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newSignupNotifications: checked})} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contentSubmissions">Content Submissions</Label>
                        <Switch 
                          id="contentSubmissions"
                          checked={notificationSettings.contentSubmissionNotifications} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, contentSubmissionNotifications: checked})} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="systemAlerts">System Alerts</Label>
                        <Switch 
                          id="systemAlerts"
                          checked={notificationSettings.systemAlerts} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveAppearance}>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the admin dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={appearanceSettings.theme} 
                      onValueChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <Select 
                      value={appearanceSettings.accentColor} 
                      onValueChange={(value) => setAppearanceSettings({...appearanceSettings, accentColor: value})}
                    >
                      <SelectTrigger id="accentColor">
                        <SelectValue placeholder="Select accent color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Sidebar Collapsed by Default</Label>
                      <p className="text-sm text-gray-500">Start with a collapsed sidebar for more screen space</p>
                    </div>
                    <Switch 
                      checked={appearanceSettings.sidebarCollapsed} 
                      onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, sidebarCollapsed: checked})} 
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Dense Mode</Label>
                      <p className="text-sm text-gray-500">Compact UI with less padding</p>
                    </div>
                    <Switch 
                      checked={appearanceSettings.denseMode} 
                      onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, denseMode: checked})} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4 mr-2" />
                      Save Appearance Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveGeneral}>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input 
                    id="siteName" 
                    value={generalSettings.siteName} 
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={generalSettings.contactEmail} 
                    onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input 
                    id="supportPhone" 
                    value={generalSettings.supportPhone} 
                    onChange={(e) => setGeneralSettings({...generalSettings, supportPhone: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={generalSettings.timezone} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Save General Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <Card className="border-green-200 shadow-md">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex items-center">
                <Rocket className="h-5 w-5 mr-2 text-green-600" />
                <CardTitle>Platform Settings</CardTitle>
              </div>
              <CardDescription>Configure global platform settings and features</CardDescription>
            </CardHeader>
            <form onSubmit={handleSavePlatform}>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-800 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Important Information
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Changing these settings affects how users interact with the platform. 
                    Disabling beta mode will make the platform publicly accessible and hide beta-related UI elements.
                  </p>
                </div>
                
                <div className="space-y-8">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="betaMode" className="text-base font-medium">Beta Mode</Label>
                        <BetaModeToggle 
                          id="betaMode" 
                          checked={platformSettings.betaMode} 
                          onCheckedChange={(checked) => {
                            setPlatformSettings({...platformSettings, betaMode: checked});
                            if (!checked) {
                              toast({
                                title: "Platform Going Live!",
                                description: "Beta mode is being disabled. The platform will be in production mode.",
                              });
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {platformSettings.betaMode 
                          ? "The platform is currently in beta mode. Only invited users can access it." 
                          : "The platform is in production mode and publicly accessible."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="requireInvites" className="text-base font-medium">Require Invites</Label>
                        <Switch 
                          id="requireInvites" 
                          checked={platformSettings.requireInvites} 
                          onCheckedChange={(checked) => setPlatformSettings({...platformSettings, requireInvites: checked})}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        When enabled, new users need an invitation code to register.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="enableFeedback" className="text-base font-medium">Enable Feedback</Label>
                        <Switch 
                          id="enableFeedback" 
                          checked={platformSettings.enableFeedback} 
                          onCheckedChange={(checked) => setPlatformSettings({...platformSettings, enableFeedback: checked})}
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Allow users to submit feedback through the platform.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="maintenanceMode" className="text-base font-medium">Maintenance Mode</Label>
                        <Switch 
                          id="maintenanceMode" 
                          checked={platformSettings.maintenanceMode} 
                          onCheckedChange={(checked) => setPlatformSettings({...platformSettings, maintenanceMode: checked})}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Put the platform in maintenance mode. Only admins can access the site.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-gray-50 py-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Platform Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
