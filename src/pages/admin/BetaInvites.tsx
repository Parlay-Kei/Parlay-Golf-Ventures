/**
 * Beta Invites Admin Page
 * 
 * This page allows administrators to manage beta invites, including:
 * - Viewing all existing invites and their status
 * - Creating new invites
 * - Sending invites
 * - Bulk inviting users
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { betaService, BetaInvite, InviteStatus } from '@/lib/services/betaService';
import { handleApiError } from '@/lib/utils/errorHandler';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PlusIcon, SendIcon, UsersIcon, RefreshCwIcon } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminToolsFallback } from '@/components/fallbacks';
import withErrorBoundary from '@/components/withErrorBoundary';

const BetaInvitesContent = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<BetaInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteNotes, setNewInviteNotes] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [selectedInvite, setSelectedInvite] = useState<BetaInvite | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isBulkInviting, setIsBulkInviting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<InviteStatus | 'all'>('all');

  // Fetch all invites
  const fetchInvites = async () => {
    setLoading(true);
    try {
      const data = await betaService.getAllInvites();
      setInvites(data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch beta invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  // Create a new invite
  const handleCreateInvite = async () => {
    if (!newInviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsCreating(true);
    try {
      await betaService.createInvite(newInviteEmail.trim(), user?.id, newInviteNotes.trim() || undefined);
      toast.success('Invite created successfully');
      setNewInviteEmail('');
      setNewInviteNotes('');
      fetchInvites();
    } catch (error) {
      handleApiError(error, 'Failed to create invite');
    } finally {
      setIsCreating(false);
    }
  };

  // Send an invite
  const handleSendInvite = async (inviteId: string) => {
    setIsSending(true);
    try {
      const success = await betaService.sendInvite(inviteId);
      if (success) {
        toast.success('Invite sent successfully');
        fetchInvites();
      } else {
        toast.error('Failed to send invite');
      }
    } catch (error) {
      handleApiError(error, 'Failed to send invite');
    } finally {
      setIsSending(false);
      setSelectedInvite(null);
    }
  };

  // Bulk invite users
  const handleBulkInvite = async () => {
    if (!bulkEmails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emails = bulkEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    setIsBulkInviting(true);
    try {
      const successCount = await betaService.bulkInvite(emails, user?.id);
      toast.success(`Successfully sent ${successCount} out of ${emails.length} invites`);
      setBulkEmails('');
      fetchInvites();
    } catch (error) {
      handleApiError(error, 'Failed to bulk invite users');
    } finally {
      setIsBulkInviting(false);
    }
  };

  // Filter invites by status
  const filteredInvites = filterStatus === 'all'
    ? invites
    : invites.filter(invite => invite.status === filterStatus);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get badge color based on status
  const getStatusBadge = (status: InviteStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'claimed':
        return <Badge variant="success">Claimed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Beta Invites Management</h1>
          <Button onClick={fetchInvites} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="invites">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invites">Manage Invites</TabsTrigger>
            <TabsTrigger value="create">Create Invite</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Invite</TabsTrigger>
          </TabsList>

          {/* Invites List Tab */}
          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Beta Invites</CardTitle>
                <CardDescription>
                  View and manage all beta invites. You can filter by status and send invites.
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Filter by status:</span>
                  <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as InviteStatus | 'all')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="claimed">Claimed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading invites...</div>
                ) : filteredInvites.length === 0 ? (
                  <div className="text-center py-4">No invites found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Claimed</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvites.map((invite) => (
                          <TableRow key={invite.id}>
                            <TableCell>{invite.email}</TableCell>
                            <TableCell>
                              <code className="bg-muted px-1 py-0.5 rounded">{invite.code}</code>
                            </TableCell>
                            <TableCell>{getStatusBadge(invite.status)}</TableCell>
                            <TableCell>{formatDate(invite.created_at?.toString())}</TableCell>
                            <TableCell>{formatDate(invite.sent_at?.toString())}</TableCell>
                            <TableCell>{formatDate(invite.claimed_at?.toString())}</TableCell>
                            <TableCell>
                              {invite.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedInvite(invite)}
                                  disabled={isSending}
                                >
                                  <SendIcon className="h-4 w-4 mr-1" />
                                  Send
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Invite Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Invite</CardTitle>
                <CardDescription>
                  Create a new beta invite for a specific email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes (Optional)
                    </label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this invite"
                      value={newInviteNotes}
                      onChange={(e) => setNewInviteNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateInvite}
                    disabled={isCreating || !newInviteEmail.trim()}
                    className="w-full"
                  >
                    {isCreating ? 'Creating...' : 'Create Invite'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Invite Tab */}
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Invite Users</CardTitle>
                <CardDescription>
                  Send invites to multiple users at once. Enter one email address per line.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="bulkEmails" className="text-sm font-medium">
                      Email Addresses (One per line)
                    </label>
                    <Textarea
                      id="bulkEmails"
                      placeholder="Enter email addresses, one per line"
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      rows={10}
                    />
                  </div>
                  <Button
                    onClick={handleBulkInvite}
                    disabled={isBulkInviting || !bulkEmails.trim()}
                    className="w-full"
                  >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {isBulkInviting ? 'Sending Invites...' : 'Send Bulk Invites'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Send Invite Confirmation Dialog */}
        {selectedInvite && (
          <Dialog open={!!selectedInvite} onOpenChange={(open) => !open && setSelectedInvite(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Beta Invite</DialogTitle>
                <DialogDescription>
                  Are you sure you want to send a beta invitation to {selectedInvite.email}?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">
                  This will send an email with the invite code: <code className="bg-muted px-1 py-0.5 rounded">{selectedInvite.code}</code>
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedInvite(null)} disabled={isSending}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleSendInvite(selectedInvite.id)} 
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Send Invite'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default withErrorBoundary(BetaInvitesContent, 'admin-beta-invites');
