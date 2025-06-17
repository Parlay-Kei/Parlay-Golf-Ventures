import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDataService } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/services/toast-service';
import { Loader2, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DEV_CONFIG } from '@/lib/config/env';

type ContentItem = {
  id: string;
  title: string;
  content_type: 'article' | 'video' | 'event' | 'product';
  description: string;
  content: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  thumbnail_url?: string;
};

export default function ContentTab() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();

    // Only set up real-time subscription in production mode
    if (DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      // In development mode, set up a simple interval to simulate real-time updates
      const intervalId = setInterval(() => {
        // Randomly refresh content (10% chance every 30 seconds)
        if (Math.random() < 0.1) {
          fetchContent();
        }
      }, 30000);
      
      return () => clearInterval(intervalId);
    } else {
      try {
        // Set up real-time subscription
        const subscription = supabase
          .channel('content_items_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, (payload) => {
            fetchContent();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      } catch (error) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.error('Error setting up real-time subscription:', error);
        }
      }
    }
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Use mock data service in development mode or when table doesn't exist
      const { data, error } = await mockDataService.getContent(query => 
        query.order('created_at', { ascending: false })
      );

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.error('Error fetching content:', error);
      }
      toast.error('Failed to load content items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateContentStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(id);
      
      // In development mode, just update local state without database call
      if (DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
        // Update local state immediately
        setContentItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.log(`[Dev Mode] Content status updated to ${status} for item ${id} (mock data)`);
        }
        
        toast.success(`Content has been ${status}.`);
        
        return;
      }
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // If no user is authenticated, just update local state
        setContentItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        
        toast.success(`Content has been ${status}.`);
        return;
      }
      
      // In production, update the database
      const { error } = await supabase
        .from('content_items')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setContentItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      toast.success(`Content has been ${status}.`);
    } catch (error) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.error('Error updating content status:', error);
      }
      toast.error('Failed to update status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const viewContentDetails = (content: ContentItem) => {
    setSelectedContent(content);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'event':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'product':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

  return (
    <div>
      {contentItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No content items found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Author</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contentItems.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {getTypeIcon(item.content_type)}
                      <span className="ml-2">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.content_type}</td>
                  <td className="px-4 py-3">{item.author}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewContentDetails(item)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => updateContentStatus(item.id, 'approved')}
                            disabled={processingId === item.id}
                          >
                            {processingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => updateContentStatus(item.id, 'rejected')}
                            disabled={processingId === item.id}
                          >
                            {processingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>Complete information about the content item</DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Title</h4>
                  <p>{selectedContent.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <p className="capitalize">{selectedContent.content_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Author</h4>
                  <p>{selectedContent.author}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{formatDate(selectedContent.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{getStatusBadge(selectedContent.status)}</p>
                </div>
              </div>

              {selectedContent.thumbnail_url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Thumbnail</h4>
                  <div className="mt-1">
                    <img 
                      src={selectedContent.thumbnail_url} 
                      alt={selectedContent.title} 
                      className="max-h-40 rounded-md object-cover"
                    />
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{selectedContent.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Content</h4>
                <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                  {selectedContent.content}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>

            {selectedContent && selectedContent.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => {
                    updateContentStatus(selectedContent.id, 'approved');
                    setIsDialogOpen(false);
                  }}
                  disabled={!!processingId}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    updateContentStatus(selectedContent.id, 'rejected');
                    setIsDialogOpen(false);
                  }}
                  disabled={!!processingId}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
