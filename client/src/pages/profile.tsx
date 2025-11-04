import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AppLayout } from "@/components/app-layout";
import { Copy, User, ArrowLeft, TrendingUp, Activity, Calendar, Mail, Award, Wallet, Eye, EyeOff, LogOut, Shield, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/use-currency";
import { formatBitcoin, formatCurrency } from "@/lib/utils";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { useQuery } from "@tanstack/react-query";
import type { Investment, Transaction, InvestmentPlan } from "@shared/schema";
import FluxLogoHeader from "@/components/flux-logo-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { currency } = useCurrency();
  const { data: price } = useBitcoinPrice();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: tokenBalances } = useQuery<any[]>({
    queryKey: [`/api/token-balances/${user?.id}`],
    refetchInterval: 5000,
    enabled: !!user?.id,
  });

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    refetchInterval: 30000,
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: plans } = useQuery<InvestmentPlan[]>({
    queryKey: ['/api/investment-plans'],
    enabled: !!user,
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const { data: tokenPrices } = useQuery<Record<string, { price: number; change24h: number }>>({
    queryKey: ['/api/token-prices'],
    refetchInterval: 30000,
    enabled: !!user,
  });


  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✓ Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "✓ Signed Out",
      description: "You have been signed out successfully",
    });
  };

  // Calculate total portfolio balance from BTC balance, token balances, and investments
  const btcBalance = parseFloat(user.balance) || 0;
  
  // Calculate token balance value in USD
  let tokenBalanceValueUSD = 0;
  if (tokenBalances && tokenPrices) {
    tokenBalances.forEach(balance => {
      const tokenBalance = parseFloat(balance.balance);
      const tokenPrice = tokenPrices[balance.tokenSymbol]?.price || 0;
      tokenBalanceValueUSD += tokenBalance * tokenPrice;
    });
  }
  
  const totalInvested = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const totalProfit = investments?.reduce((sum, inv) => sum + parseFloat(inv.currentProfit), 0) || 0;

  // Convert everything to BTC for total
  const btcPrice = price ? (currency === 'USD' ? price.usd.price : price.gbp.price) : 0;
  const tokenBalanceInBTC = btcPrice > 0 ? tokenBalanceValueUSD / btcPrice : 0;
  const totalPortfolioBalanceBTC = btcBalance + tokenBalanceInBTC + totalInvested + totalProfit;
  
  // Calculate fiat value
  const fiatValue = totalPortfolioBalanceBTC * btcPrice;

  const activeInvestments = investments?.filter(inv => inv.isActive).length || 0;
  const completedInvestments = investments?.filter(inv => !inv.isActive).length || 0;
  const userTransactions = transactions?.filter(tx => tx.userId === user.id).length || 0;

  const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  // Calculate trading statistics
  const totalTransactionVolume = transactions?.reduce((sum, tx) =>
    tx.status === 'confirmed' ? sum + parseFloat(tx.amount) : sum, 0
  ) || 0;

  const depositsCount = transactions?.filter(tx => tx.type === 'deposit' && tx.status === 'confirmed').length || 0;
  const withdrawalsCount = transactions?.filter(tx => tx.type === 'withdrawal' && tx.status === 'confirmed').length || 0;

  const totalDeposits = transactions?.reduce((sum, tx) =>
    tx.type === 'deposit' && tx.status === 'confirmed' ? sum + parseFloat(tx.amount) : sum, 0
  ) || 0;

  const avgInvestmentSize = activeInvestments > 0 ? totalInvested / activeInvestments : 0;
  const winRate = (activeInvestments + completedInvestments) > 0 ? ((completedInvestments / (activeInvestments + completedInvestments)) * 100) : 0;

  // Achievement calculations
  const achievements = [
    {
      id: 'first_deposit',
      name: 'First Steps',
      description: 'Made your first deposit',
      earned: depositsCount > 0,
      icon: '🎯',
      color: 'emerald'
    },
    {
      id: 'high_roller',
      name: 'High Roller',
      description: 'Total deposits over $10,000',
      earned: totalDeposits * (price?.usd.price || 0) > 10000,
      icon: '💎',
      color: 'blue'
    },
    {
      id: 'profit_master',
      name: 'Profit Master',
      description: 'Earned over $1,000 in profits',
      earned: totalProfit * (price?.usd.price || 0) > 1000,
      icon: '🏆',
      color: 'yellow'
    },
    {
      id: 'diversified',
      name: 'Diversified Trader',
      description: 'Hold 5+ different tokens',
      earned: tokenBalances ? tokenBalances.filter(tb => parseFloat(tb.balance) > 0).length >= 5 : false,
      icon: '🌟',
      color: 'purple'
    },
    {
      id: 'veteran',
      name: 'Veteran Trader',
      description: 'Account active for 30+ days',
      earned: accountAge >= 30,
      icon: '⚡',
      color: 'orange'
    },
    {
      id: 'active_investor',
      name: 'Active Investor',
      description: '3+ active investments',
      earned: activeInvestments >= 3,
      icon: '🚀',
      color: 'cyan'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned).length;

  return (
    <AppLayout>
      <div className="min-h-screen neon-bg">
        {/* Neon Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00FF80]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00CCFF]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 pb-24">
          <div className="max-w-sm mx-auto px-6 pt-6">
            <FluxLogoHeader />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-2">
                Profile
              </h1>
              <p className="text-sm text-gray-400">Manage your account</p>
            </div>

            {/* Profile Card with Balance */}
            <div
              className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#2A2A2A] flex flex-col justify-between"
              style={{
                boxShadow: "0 0 40px rgba(0, 255, 128, 0.15), inset 0 0 20px rgba(0, 255, 128, 0.05)",
              }}
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF80]/30 to-[#00CCFF]/30 flex items-center justify-center border-2 border-[#00FF80]/50"
                    style={{ boxShadow: '0 0 30px rgba(0, 255, 128, 0.3)' }}
                  >
                    <User className="w-8 h-8 text-[#00FF80]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{user.email.split('@')[0]}</h3>
                    {user.isAdmin ? (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Member
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className="rounded-xl hover:bg-muted/50"
                >
                  {showSensitiveInfo ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Balance Display */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                </div>
                {showSensitiveInfo ? (
                  <>
                    <h2 className="text-4xl font-bold text-foreground tracking-tight">
                      {formatCurrency(fiatValue, currency)}
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                      ≈ {formatBitcoin(totalPortfolioBalanceBTC)} BTC
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-foreground tracking-tight">
                      ••••••••
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                      •••••• {currency}
                    </p>
                  </>
                )}
              </div>

              {showSensitiveInfo && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/50 rounded-xl text-center">
                      <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">{accountAge}</p>
                      <p className="text-xs text-muted-foreground">Days</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl text-center">
                      <Activity className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">{userTransactions}</p>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground mb-1">ID</p>
                      <p className="font-mono text-sm text-foreground">#{user.id}</p>
                    </div>
                  </div>
                </>
              )}
            </div>


            {/* Trading Statistics */}
            <div
              className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#2A2A2A]"
              style={{
                boxShadow: "0 0 30px rgba(0, 255, 128, 0.15)",
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center border border-[#00FF80]/30">
                  <BarChart3 className="w-4 h-4 text-[#00FF80]" />
                </div>
                Trading Statistics
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A]">
                  <p className="text-xs text-gray-400 mb-1">Total Volume</p>
                  <p className="text-sm font-bold text-white truncate">{formatBitcoin(totalTransactionVolume.toString())} BTC</p>
                  <p className="text-xs text-emerald mt-1">
                    ≈ {price ? formatCurrency(totalTransactionVolume * (currency === 'USD' ? price.usd.price : price.gbp.price), currency) : '...'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A]">
                  <p className="text-xs text-gray-400 mb-1">Avg Investment</p>
                  <p className="text-sm font-bold text-white truncate">{formatBitcoin(avgInvestmentSize.toString())} BTC</p>
                  <p className="text-xs text-blue-400 mt-1">Per plan</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-emerald/5 border border-emerald/20 text-center">
                  <p className="text-lg font-bold text-emerald">{depositsCount}</p>
                  <p className="text-xs text-gray-400">Deposits</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                  <p className="text-lg font-bold text-blue-400">{withdrawalsCount}</p>
                  <p className="text-xs text-gray-400">Withdrawals</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                  <p className="text-lg font-bold text-purple-400">{winRate.toFixed(0)}%</p>
                  <p className="text-xs text-gray-400">Win Rate</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div
              className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#2A2A2A]"
              style={{
                boxShadow: "0 0 30px rgba(251, 191, 36, 0.1)",
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <Award className="w-4 h-4 text-yellow-500" />
                  </div>
                  Achievements
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {earnedAchievements}/{achievements.length}
                </Badge>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-xl border transition-all ${
                      achievement.earned
                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                        : 'bg-[#0A0A0A]/30 border-[#2A2A2A] opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <p className="text-xs font-bold text-white mb-1">{achievement.name}</p>
                    <p className="text-[10px] text-gray-400">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Performance */}
            <div
              className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#2A2A2A]"
              style={{
                boxShadow: "0 0 30px rgba(0, 255, 128, 0.15)",
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center border border-[#00FF80]/30">
                  <TrendingUp className="w-4 h-4 text-[#00FF80]" />
                </div>
                Investment Performance
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                  <p className="text-xs text-gray-400 mb-1">Total Invested</p>
                  <p className="text-base font-bold text-white truncate">{formatBitcoin(totalInvested.toString())}</p>
                  <p className="text-[10px] text-emerald mt-0.5">
                    ≈ {price ? formatCurrency(totalInvested * btcPrice, currency) : '...'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <p className="text-xs text-gray-400 mb-1">Total Profit</p>
                  <p className="text-base font-bold text-white truncate">{formatBitcoin(totalProfit.toString())}</p>
                  <p className="text-[10px] text-blue-400 mt-0.5">
                    ≈ {price ? formatCurrency(totalProfit * btcPrice, currency) : '...'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A] text-center">
                  <p className="text-2xl font-bold text-[#00FF80]">{activeInvestments}</p>
                  <p className="text-xs text-gray-400">Active Plans</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A] text-center">
                  <p className="text-2xl font-bold text-blue-400">{completedInvestments}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div
              className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#2A2A2A]"
              style={{
                boxShadow: "0 0 30px rgba(0, 204, 255, 0.1)",
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00CCFF]/20 flex items-center justify-center border border-[#00CCFF]/30">
                  <User className="w-4 h-4 text-[#00CCFF]" />
                </div>
                Account Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{user.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.email, 'Email')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Member Since</span>
                  </div>
                  <span className="text-sm text-white font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0A0A0A]/50 border border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Account Age</span>
                  </div>
                  <span className="text-sm text-white font-medium">{accountAge} days</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Button
                onClick={() => setLocation('/settings')}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00FF80]/20 to-[#00CCFF]/20 hover:from-[#00FF80]/30 hover:to-[#00CCFF]/30 text-white border-2 border-[#00FF80]/30 font-bold transition-all duration-300"
                style={{ boxShadow: '0 0 30px rgba(0, 255, 128, 0.2)' }}
              >
                <User className="w-5 h-5 mr-2" />
                Account Settings
              </Button>

              <Button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 border-2 border-red-500/30 font-bold transition-all duration-300"
                style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)' }}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <BottomNavigation />

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <AlertDialogContent className="bg-[#1A1A1A]/95 backdrop-blur-xl border-2 border-red-500/30"
            style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)' }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                <LogOut className="w-6 h-6 text-red-400" />
                Sign Out?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 text-base">
                Are you sure you want to sign out of your FluxTrade account? You'll need to log in again to access your portfolio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#3A3A3A] text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}