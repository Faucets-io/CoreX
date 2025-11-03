import { useAuth } from "@/hooks/use-auth";
import { NeonBackdrop } from "@/components/neon-backdrop";
import { NeonHeader } from "@/components/neon-header";
import { BalanceOverview } from "@/components/balance-overview";
import { QuickActionsGrid } from "@/components/quick-actions-grid";
import { ActiveInvestmentsList } from "@/components/active-investments-list";
import { RecentActivityList } from "@/components/recent-activity-list";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }

    if (!user.hasWallet) {
      setLocation('/wallet-setup');
    }
  }, [user, setLocation]);

  if (!user) {
    return <div className="neon-bg min-h-screen flex items-center justify-center neon-text">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen neon-bg">
      {/* Animated Neon Background */}
      <NeonBackdrop />
      
      {/* Header */}
      <NeonHeader />
      
      {/* Main Content */}
      <main className="relative z-10 pb-24">
        {/* Dashboard Overview - Greeting + Balance */}
        <BalanceOverview />
        
        {/* Quick Actions Grid */}
        <QuickActionsGrid />
        
        {/* Active Investments */}
        <ActiveInvestmentsList />
        
        {/* Recent Activity */}
        <RecentActivityList />
      </main>
    </div>
  );
}
