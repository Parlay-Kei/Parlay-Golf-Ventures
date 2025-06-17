import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Send, Mail, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CommunicationsTab() {
  const [sending, setSending] = useState(false);
  const [communicationType, setCommunicationType] = useState('email');
  const [recipientType, setRecipientType] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeImage, setIncludeImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string[]>([]);
  
  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both subject and message content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);
      
      // In a real application, you would integrate with an email service or push notification service
      // Here we'll simulate by storing the communication in Supabase
      const { data, error } = await supabase
        .from('communications')
        .insert([
          {
            type: communicationType,
            recipient_type: recipientType,
            subject,
            message,
            skill_level_filter: skillLevelFilter.length > 0 ? skillLevelFilter : null,
            include_image: includeImage,
            image_url: includeImage ? imageUrl : null,
            sent_at: new Date().toISOString(),
            sent_by: (await supabase.auth.getUser()).data.user?.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Communication Sent',
        description: `Your ${communicationType} has been sent successfully.`,
      });

      // Reset form
      setSubject('');
      setMessage('');
      setIncludeImage(false);
      setImageUrl('');
      setSkillLevelFilter([]);
    } catch (error) {
      console.error('Error sending communication:', error);
      toast({
        title: 'Error',
        description: 'Failed to send communication. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const toggleSkillLevel = (level: string) => {
    setSkillLevelFilter((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  return (
    <div>
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication Type</CardTitle>
                <CardDescription>Choose how to reach your members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    variant={communicationType === 'email' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setCommunicationType('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </Button>
                  <Button
                    variant={communicationType === 'push' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setCommunicationType('push')}
                  >
                    <Bell className="h-4 w-4 mr-2" /> Push Notification
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recipients</CardTitle>
                <CardDescription>Select who should receive this communication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Recipient Group</Label>
                    <Select value={recipientType} onValueChange={setRecipientType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="active">Active Members Only</SelectItem>
                        <SelectItem value="pending">Pending Approvals</SelectItem>
                        <SelectItem value="filtered">Custom Filter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recipientType === 'filtered' && (
                    <div className="space-y-2">
                      <Label>Filter by Skill Level</Label>
                      <div className="flex flex-wrap gap-2">
                        {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                          <Button
                            key={level}
                            variant={skillLevelFilter.includes(level) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleSkillLevel(level)}
                            className="capitalize"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>Compose your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-image"
                  checked={includeImage}
                  onCheckedChange={setIncludeImage}
                />
                <Label htmlFor="include-image">Include Image</Label>
              </div>

              {includeImage && (
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-h-40 rounded-md object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Send {communicationType === 'email' ? 'Email' : 'Notification'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>View past communications sent to members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Communication history will be displayed here. Connect to your Supabase database to view real data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
