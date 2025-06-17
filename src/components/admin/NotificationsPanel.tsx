import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedTabs, EnhancedTabsContent, EnhancedTabsList, EnhancedTabsTrigger } from '@/components/ui/enhanced-tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { Bell, Users, Calendar, AlertCircle, MessageSquare, Check, CheckCheck, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'user' | 'content' | 'system' | 'message';
  created_at: string;
  read: boolean;
}

// Mock data for notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  { 
    id: '1', 
    title: 'New User Registration', 
    message: 'John Doe has registered as a new user', 
    type: 'user',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
    read: false 
  },
  { 
    id: '2', 
    title: 'Content Submission', 
    message: 'A new swing analysis has been submitted for review', 
    type: 'content',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), 
    read: false 
  },
  { 
    id: '3', 
    title: 'Tournament Registration', 
    message: '5 new players registered for the upcoming tournament', 
    type: 'content',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    read: true 
  },
  { 
    id: '4', 
    title: 'System Update', 
    message: 'Platform will undergo maintenance tonight at 2 AM EST', 
    type: 'system',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    read: true 
  },
  { 
    id: '5', 
    title: 'New Message', 
    message: 'You have a new message from support team', 
    type: 'message',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
    read: false 
  },
  { 
    id: '6', 
    title: 'Beta Mode Disabled', 
    message: 'The platform has been switched to production mode', 
    type: 'system',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), 
    read: false 
  },
];

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      
      // Use mock data for now
      setTimeout(() => {
        setNotifications(MOCK_NOTIFICATIONS);
        setLoading(false);
      }, 500);
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      setNotifications(MOCK_NOTIFICATIONS); // Fallback to mock data
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // In a real app, we would update in Supabase
    // await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('id', id);
    
    // Update locally for now
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    // In a real app, we would update in Supabase
    // await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('read', false);
    
    // Update locally for now
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = async (id: string) => {
    // In a real app, we would delete from Supabase
    // await supabase
    //   .from('notifications')
    //   .delete()
    //   .eq('id', id);
    
    // Update locally for now
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeTab);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-5 w-5 text-blue-500" aria-hidden="true" />;
      case 'content': return <Calendar className="h-5 w-5 text-green-500" aria-hidden="true" />;
      case 'system': return <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-purple-500" aria-hidden="true" />;
      default: return <Bell className="h-5 w-5 text-gray-500" aria-hidden="true" />;
    }
  };

  const getUnreadCount = (type: string = 'all') => {
    if (type === 'all') return notifications.filter(n => !n.read).length;
    if (type === 'unread') return notifications.filter(n => !n.read).length;
    return notifications.filter(n => n.type === type && !n.read).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" aria-hidden="true" />
          Notifications
          {getUnreadCount() > 0 && (
            <Badge variant="destructive" className="ml-2">
              {getUnreadCount()}
            </Badge>
          )}
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={markAllAsRead}
          disabled={getUnreadCount() === 0}
          aria-label="Mark all notifications as read"
        >
          <CheckCheck className="h-4 w-4 mr-1" aria-hidden="true" />
          Mark all read
        </Button>
      </div>

      <EnhancedTabs value={activeTab} onValueChange={setActiveTab}>
        <EnhancedTabsList className="w-full border-b bg-gray-50" ariaLabel="Notification filters">
          <EnhancedTabsTrigger 
            value="all" 
            className="flex-1"
            controls="notifications-all"
          >
            All
            {getUnreadCount('all') > 0 && (
              <Badge variant="secondary" className="ml-2">{getUnreadCount('all')}</Badge>
            )}
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger 
            value="unread" 
            className="flex-1"
            controls="notifications-unread"
          >
            Unread
            {getUnreadCount('unread') > 0 && (
              <Badge variant="secondary" className="ml-2">{getUnreadCount('unread')}</Badge>
            )}
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger 
            value="user" 
            className="flex-1"
            controls="notifications-user"
          >
            Users
            {getUnreadCount('user') > 0 && (
              <Badge variant="secondary" className="ml-2">{getUnreadCount('user')}</Badge>
            )}
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger 
            value="content" 
            className="flex-1"
            controls="notifications-content"
          >
            Content
            {getUnreadCount('content') > 0 && (
              <Badge variant="secondary" className="ml-2">{getUnreadCount('content')}</Badge>
            )}
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger 
            value="system" 
            className="flex-1"
            controls="notifications-system"
          >
            System
            {getUnreadCount('system') > 0 && (
              <Badge variant="secondary" className="ml-2">{getUnreadCount('system')}</Badge>
            )}
          </EnhancedTabsTrigger>
        </EnhancedTabsList>

        {['all', 'unread', 'user', 'content', 'system'].map((tab) => (
          <EnhancedTabsContent 
            key={tab} 
            value={tab}
            panelId={`notifications-${tab}`}
          >
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : getFilteredNotifications().length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">No notifications to display</p>
                </div>
              ) : (
                <ul className="divide-y" role="list" aria-label={`${tab} notifications`}>
                  {getFilteredNotifications().map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      role="listitem"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                              {!notification.read && (
                                <span className="sr-only">(unread)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          <div className="mt-2 flex space-x-2">
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                aria-label={`Mark ${notification.title} as read`}
                              >
                                <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                                Mark read
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteNotification(notification.id)}
                              aria-label={`Delete ${notification.title} notification`}
                            >
                              <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </EnhancedTabsContent>
        ))}
      </EnhancedTabs>
    </div>
  );
};

export default NotificationsPanel;
