import { useAuth } from "@/hooks/use-auth";
import { useInvestmentWebSocket } from "@/hooks/use-websocket";
import { NeonBackdrop } from "@/components/neon-backdrop";
import { NeonHeader } from "@/components/neon-header";
import { BalanceOverview } from "@/components/balance-overview";
import { QuickActionsGrid } from "@/components/quick-actions-grid";
import { ActiveInvestmentsList } from "@/components/active-investments-list";
import { RecentActivityList } from "@/components/recent-activity-list";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Investment, Transaction, TokenBalance } from "@shared/schema";
import { TrendingUp, TrendingDown, Activity, DollarSign, PieChart, BarChart3, Zap, Target, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency, formatBitcoin } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import SecurityFeatures from "@/components/security-features";
import FluxLogoHeader from "@/components/flux-logo-header";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { currency } = useCurrency();
  const { data: price } = useBitcoinPrice();

  // Connect to WebSocket for real-time investment updates
  useInvestmentWebSocket(user?.id);

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: tokenBalances } = useQuery<TokenBalance[]>({
    queryKey: [`/api/token-balances/${user?.id}`],
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const { data: tokenPrices } = useQuery<Record<string, { price: number; change24h: number }>>({
    queryKey: ['/api/token-prices'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (user && !user.hasWallet) {
      setLocation('/wallet-setup');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="neon-bg min-h-screen flex items-center justify-center neon-text">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{ opacity: 0.6 }}>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(150 100% 60%) 0%, hsl(150 100% 40%) 50%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(150 100% 50%) 0%, hsl(150 100% 35%) 50%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse-slow"
              style={{ background: 'radial-gradient(circle, hsl(150 100% 55%) 0%, transparent 70%)' }} />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md w-full">
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#00FF80]/30 text-center"
            style={{ boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)" }}>
            <FluxLogoHeader />
            <div className="mb-6 mt-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00FF80] to-[#00CC66] flex items-center justify-center mx-auto mb-4"
                style={{ boxShadow: "0 0 30px rgba(0, 255, 128, 0.5)" }}>
                <Lock className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-3">
                Access Restricted
              </h1>
              <p className="text-lg text-gray-300 mb-2">Please log in to access your dashboard</p>
              <p className="text-sm text-gray-400">Your wallet and investments are protected</p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => setLocation('/login')}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00FF80] to-[#00CC66] hover:opacity-90 text-black font-bold transition-all group"
                style={{ boxShadow: '0 0 20px rgba(0, 255, 128, 0.4)' }}>
                Sign In
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => setLocation('/register')} variant="outline"
                className="w-full h-12 rounded-xl border-[#00FF80]/30 text-[#00FF80] hover:bg-[#00FF80]/10 font-semibold">
                Create Account
              </Button>
              <Button onClick={() => setLocation('/')} variant="ghost" className="w-full text-gray-400 hover:text-white">
                Back to Home
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate portfolio analytics
  const totalInvested = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const totalProfit = investments?.reduce((sum, inv) => sum + parseFloat(inv.currentProfit), 0) || 0;
  const activeInvestments = investments?.filter(inv => inv.isActive).length || 0;
  const completedInvestments = investments?.filter(inv => !inv.isActive).length || 0;

  const last30DaysTransactions = transactions?.filter(tx => {
    const txDate = new Date(tx.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return txDate >= thirtyDaysAgo;
  }).length || 0;

  // Calculate deposits and withdrawals in USD
  const totalDeposits = transactions?.filter(tx => tx.type === 'deposit' && tx.status === 'confirmed')
    .reduce((sum, tx) => {
      const amountInBtc = parseFloat(tx.amount);
      const amountInUsd = price ? amountInBtc * price.usd.price : 0;
      return sum + amountInUsd;
    }, 0) || 0;

  const totalWithdrawals = transactions?.filter(tx => tx.type === 'withdrawal' && tx.status === 'confirmed')
    .reduce((sum, tx) => {
      const amountInBtc = parseFloat(tx.amount);
      const amountInUsd = price ? amountInBtc * price.usd.price : 0;
      return sum + amountInUsd;
    }, 0) || 0;

  const profitMargin = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
  const roiPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

  // Calculate portfolio diversity
  let portfolioTokens = 0;
  if (tokenBalances) {
    portfolioTokens = tokenBalances.filter(tb => parseFloat(tb.balance) > 0).length;
  }

  return (
    <div className="min-h-screen neon-bg">
      {/* Animated Neon Background */}
      <NeonBackdrop />

      {/* Header */}
      <main className="relative z-10 pb-32">
        {/* Dashboard Overview - Greeting + Balance */}
        <div className="relative z-10 pb-24">
          <div className="max-w-sm mx-auto px-6 pt-6">
            <FluxLogoHeader />
            <NeonHeader />
          </div>
        </div>

        <BalanceOverview />

        {/* Portfolio Analytics Section */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold neon-text mb-4"
          >
            Portfolio Analytics
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="neon-card border neon-border rounded-xl hover:scale-105 transition-all"
                style={{ boxShadow: '0 0 15px rgba(0, 255, 128, 0.1)' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold neon-text">{roiPercentage.toFixed(2)}%</p>
                  <p className="text-xs neon-text-secondary">Total ROI</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card className="neon-card border neon-border rounded-xl hover:scale-105 transition-all"
                style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold neon-text">{activeInvestments}</p>
                  <p className="text-xs neon-text-secondary">Active Plans</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="neon-card border neon-border rounded-xl hover:scale-105 transition-all"
                style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold neon-text">{last30DaysTransactions}</p>
                  <p className="text-xs neon-text-secondary">30D Transactions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card className="neon-card border neon-border rounded-xl hover:scale-105 transition-all"
                style={{ boxShadow: '0 0 15px rgba(251, 146, 60, 0.1)' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold neon-text">{portfolioTokens}</p>
                  <p className="text-xs neon-text-secondary">Token Types</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="neon-card border neon-border rounded-xl mb-6"
              style={{ boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)' }}
            >
              <CardHeader>
                <CardTitle className="text-lg neon-text flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm neon-text-secondary">Total Deposits</p>
                      <TrendingUp className="w-4 h-4 text-emerald" />
                    </div>
                    <p className="text-xl font-bold neon-text">${totalDeposits.toFixed(2)}</p>
                    <p className="text-xs text-emerald mt-1">USD</p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm neon-text-secondary">Total Withdrawals</p>
                      <TrendingDown className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold neon-text">${totalWithdrawals.toFixed(2)}</p>
                    <p className="text-xs text-blue-500 mt-1">USD</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm neon-text-secondary">Profit Margin</p>
                      <Zap className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-xl font-bold neon-text">{profitMargin.toFixed(2)}%</p>
                    <p className="text-xs text-purple-500 mt-1">
                      +{formatBitcoin(totalProfit.toString())} BTC
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald/10 to-blue-500/10 border border-emerald/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm neon-text-secondary mb-1">Investment Success Rate</p>
                      <p className="text-2xl font-bold neon-text">
                        {completedInvestments > 0 ? ((completedInvestments / (activeInvestments + completedInvestments)) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs neon-text-secondary">Completed Plans</p>
                      <p className="text-lg font-bold text-emerald">{completedInvestments}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Active Investments */}
        <ActiveInvestmentsList />

        {/* Recent Activity */}
        <RecentActivityList />

        {/* Referral Program (Removed) */}
        {/* Removed referral program section as per user request */}

        {/* Security Features (Added if applicable) */}
        {/* <SecurityFeatures /> */}

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}