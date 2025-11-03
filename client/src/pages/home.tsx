import { useAuth } from "@/hooks/use-auth";
import { useInvestmentWebSocket } from "@/hooks/use-websocket";
import { NeonBackdrop } from "@/components/neon-backdrop";
import { NeonHeader } from "@/components/neon-header";
import { BalanceOverview } from "@/components/balance-overview";
import { QuickActionsGrid } from "@/components/quick-actions-grid";
import { ActiveInvestmentsList } from "@/components/active-investments-list";
import { RecentActivityList } from "@/components/recent-activity-list";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Connect to WebSocket for real-time investment updates
  useInvestmentWebSocket(user?.id);

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (isLoading) return;
    
    if (!user) {
      setLocation('/login');
      return;
    }

    if (!user.hasWallet) {
      setLocation('/wallet-setup');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="neon-bg min-h-screen flex items-center justify-center neon-text">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen neon-bg">
      {/* Animated Neon Background */}
      <NeonBackdrop />
      
      {/* Header */}
      <NeonHeader />
      
      {/* Main Content */}
      <main className="relative z-10 pb-32">
        {/* Dashboard Overview - Greeting + Balance */}
        <BalanceOverview />
        
        {/* Quick Actions Grid */}
        <QuickActionsGrid />
        
        {/* Active Investments */}
        <ActiveInvestmentsList />
        
        {/* Recent Activity */}
        <RecentActivityList />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
