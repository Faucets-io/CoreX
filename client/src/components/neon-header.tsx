import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function NeonHeader() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications', user?.id, 'unread-count'],
    queryFn: () => fetch(`/api/notifications/${user?.id}/unread-count`).then(res => res.json()),
    enabled: !!user?.id,
  });

  return (
    <header className="sticky top-0 z-50 neon-bg border-b neon-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="text-2xl font-bold neon-gradient bg-clip-text"
            style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            data-testid="text-logo"
          >
            FluxTrade
          </div>

          {/* Right side - Profile and Notifications */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-white/10 neon-text"
              onClick={() => setLocation('/notifications')}
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount.count > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center neon-glow-pulse"
                  data-testid="badge-notification-count"
                >
                  {unreadCount.count > 9 ? '9+' : unreadCount.count}
                </Badge>
              )}
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10 neon-text neon-glow"
              onClick={() => setLocation('/profile')}
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
