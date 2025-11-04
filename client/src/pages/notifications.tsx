import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle, Clock, Filter, Check, ArrowLeft, Zap, Lock, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Notification } from '@shared/schema';
import { cn } from '@/lib/utils';
import { BottomNavigation } from "@/components/bottom-navigation";
import FluxLogoHeader from "@/components/flux-logo-header"; // Added import
import AppLayout from '@/components/layouts/app-layout'; // Assuming this is the layout component
import { motion } from 'framer-motion'; // Assuming framer-motion is used for animations

export default function Notifications() {
  const { user, isLoading } = useAuth(); // Assuming useAuth returns an isLoading state
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-md w-full">
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#00FF80]/30 text-center"
              style={{ boxShadow: "0 0 40px rgba(0, 255, 128, 0.2)" }}>
              <FluxLogoHeader />
              <div className="mb-6 mt-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00FF80] to-[#00CC66] flex items-center justify-center mx-auto mb-4"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 128, 0.5)" }}>
                  <Lock className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-3">
                  Access Restricted
                </h1>
                <p className="text-lg text-gray-300 mb-2">Please log in to view notifications</p>
              </div>
              <div className="space-y-3">
                <Button onClick={() => setLocation('/login')}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00FF80] to-[#00CC66] hover:opacity-90 text-black font-bold"
                  style={{ boxShadow: '0 0 20px rgba(0, 255, 128, 0.4)' }}>
                  Sign In <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button onClick={() => setLocation('/register')} variant="outline"
                  className="w-full h-12 rounded-xl border-[#00FF80]/30 text-[#00FF80] hover:bg-[#00FF80]/10">
                  Create Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const { data: notifications, isLoading: areNotificationsLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', user?.id],
    queryFn: () => fetch(`/api/notifications/${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications', user?.id, 'unread-count'],
    queryFn: () => fetch(`/api/notifications/${user?.id}/unread-count`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', user?.id, 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notifications/${user?.id}/mark-all-read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', user?.id, 'unread-count'] });
    },
  });

  const getTypeIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success': return <CheckCircle className={`${iconClass} text-[#00FF80]`} />;
      case 'warning': return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'error': return <AlertCircle className={`${iconClass} text-red-500`} />;
      default: return <Info className={`${iconClass} text-[#00CCFF]`} />;
    }
  };

  const getFilteredNotifications = () => {
    if (!notifications) return [];
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.isRead);
      case 'read': return notifications.filter(n => n.isRead);
      default: return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-black" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FF80] rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00CCFF] rounded-full filter blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 pb-24">
        <div className="max-w-sm mx-auto px-6 pt-6">
          <FluxLogoHeader />

          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/home')}
              className="mb-4 rounded-xl hover:bg-[#1A1A1A] border border-[#2A2A2A]"
            >
              <ArrowLeft className="w-5 h-5 text-[#00FF80]" />
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FF80] to-[#00CCFF] flex items-center justify-center">
                <Bell className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-sm text-gray-400">Stay updated with your activity</p>
              </div>
            </div>

            {unreadCount && unreadCount.count > 0 && (
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="w-full mt-4 bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black font-semibold hover:opacity-90 rounded-xl"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-1 mb-6">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "py-3 px-4 rounded-xl font-semibold text-sm transition-all",
                  filter === 'all'
                    ? "bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                    : "text-gray-400 hover:text-white"
                )}
              >
                All ({notifications?.length || 0})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  "py-3 px-4 rounded-xl font-semibold text-sm transition-all",
                  filter === 'unread'
                    ? "bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                    : "text-gray-400 hover:text-white"
                )}
              >
                Unread ({unreadCount?.count || 0})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={cn(
                  "py-3 px-4 rounded-xl font-semibold text-sm transition-all",
                  filter === 'read'
                    ? "bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                    : "text-gray-400 hover:text-white"
                )}
              >
                Read ({(notifications?.length || 0) - (unreadCount?.count || 0)})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {areNotificationsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2A2A2A] rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-[#2A2A2A] rounded w-3/4"></div>
                      <div className="h-3 bg-[#2A2A2A] rounded w-1/2"></div>
                      <div className="h-3 bg-[#2A2A2A] rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300",
                    !notification.isRead
                      ? "border-[#00FF80] shadow-lg shadow-[#00FF80]/20"
                      : "border-[#2A2A2A]"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "p-3 rounded-xl flex-shrink-0",
                        notification.type === 'success' && "bg-[#00FF80]/10",
                        notification.type === 'warning' && "bg-yellow-500/10",
                        notification.type === 'error' && "bg-red-500/10",
                        notification.type === 'info' && "bg-[#00CCFF]/10"
                      )}>
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-white text-lg leading-tight">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge className="bg-[#00FF80] text-black text-xs font-semibold">
                              NEW
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-400 mb-4 leading-relaxed text-sm whitespace-pre-line break-words">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-4 h-4" />
                            {formatDate(new Date(notification.createdAt))}
                          </div>

                          {!notification.isRead && (
                            <Button
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              className="bg-[#2A2A2A] text-[#00FF80] hover:bg-[#3A3A3A] rounded-xl text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#00FF80]/20 to-[#00CCFF]/20 rounded-2xl flex items-center justify-center">
                <Bell className="w-10 h-10 text-[#00FF80]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === 'unread' ? 'All Caught Up!' :
                 filter === 'read' ? 'No Read Notifications' : 'No Notifications Yet'}
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                {filter === 'unread'
                  ? "You're all caught up! Check back later for new updates."
                  : filter === 'read'
                  ? "You haven't read any notifications yet."
                  : "We'll notify you when there's something important to share."}
              </p>
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}