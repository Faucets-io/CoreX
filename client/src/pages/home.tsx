
import { useAuth } from "@/hooks/use-auth";
import { WalletBalance } from "@/components/wallet-balance";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, User, ArrowUpRight, ArrowDownLeft, TrendingUp, Activity, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Investment, InvestmentPlan } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatBitcoin, calculateInvestmentProgress, formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const { data: investmentPlans } = useQuery<InvestmentPlan[]>({
    queryKey: ['/api/investment-plans'],
    enabled: !!user,
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications', user?.id, 'unread-count'],
    queryFn: () => fetch(`/api/notifications/${user?.id}/unread-count`).then(res => res.json()),
    enabled: !!user?.id,
  });

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
    return <div>Redirecting to login...</div>;
  }

  const activeInvestments = investments?.filter(inv => inv.isActive) || [];

  const totalInvestedAmount = investments?.reduce((total, inv) => 
    total + parseFloat(inv.amount), 0
  ) || 0;

  const totalProfit = investments?.reduce((total, inv) => 
    total + parseFloat(inv.currentProfit), 0
  ) || 0;

  const currentPlan = user?.currentPlanId 
    ? investmentPlans?.find(plan => plan.id === user.currentPlanId)
    : null;

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-24 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-flux-cyan/10 to-flux-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-flux-blue/10 to-sapphire/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Clean Header */}
      <header className="relative px-6 pt-8 pb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-flux-cyan via-flux-purple to-flux-blue bg-clip-text text-transparent animate-pulse-slow">
              FluxTrade
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl relative hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all hover:scale-110" 
              onClick={() => setLocation('/notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount.count > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse">
                  {unreadCount.count > 9 ? '9+' : unreadCount.count}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all hover:scale-110" 
              onClick={() => setLocation('/profile')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Wallet Balance - Hero Section */}
      <div className="relative px-6 mb-8">
        <WalletBalance />
      </div>

      {/* Quick Actions */}
      <div className="relative px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-20 rounded-3xl bg-gradient-to-br from-emerald/20 to-emerald/10 hover:from-emerald/30 hover:to-emerald/20 border-2 border-emerald/30 text-foreground flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald/20 backdrop-blur-sm"
            onClick={() => setLocation('/deposit')}
            variant="outline"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald/30 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald" />
            </div>
            <span className="text-sm font-semibold">Deposit</span>
          </Button>
          <Button 
            className="h-20 rounded-3xl bg-gradient-to-br from-ruby/20 to-ruby/10 hover:from-ruby/30 hover:to-ruby/20 border-2 border-ruby/30 text-foreground flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-ruby/20 backdrop-blur-sm"
            onClick={() => setLocation('/withdraw')}
            variant="outline"
          >
            <div className="w-10 h-10 rounded-2xl bg-ruby/30 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-ruby" />
            </div>
            <span className="text-sm font-semibold">Withdraw</span>
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="relative px-6 mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-flux-cyan to-flux-purple rounded-full"></div>
          Market Overview
        </h3>
        <Card className="border-0 bg-gradient-to-br from-flux-cyan/10 via-flux-purple/5 to-flux-blue/10 p-6 rounded-3xl backdrop-blur-sm shadow-2xl hover:shadow-flux-cyan/20 transition-all">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-bitcoin/30 to-bitcoin/10 flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <span className="text-2xl font-bold text-bitcoin">₿</span>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Bitcoin</p>
                  <p className="text-xs text-muted-foreground font-medium">BTC</p>
                </div>
              </div>
              <Badge className="bg-emerald/20 text-emerald border-emerald/30 text-xs px-3 py-1 rounded-full animate-pulse" variant="outline">
                Live Trading
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-5 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Active Investments</p>
                <p className="text-2xl font-bold text-foreground">{activeInvestments.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Total Return</p>
                <p className="text-2xl font-bold text-emerald">+{formatBitcoin(totalProfit.toString())}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Stats */}
      <div className="relative px-6 mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-flux-cyan to-flux-purple rounded-full"></div>
          Portfolio
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 bg-gradient-to-br from-emerald/15 to-emerald/5 p-5 rounded-3xl backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-emerald/20 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald/30 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-emerald" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Invested</span>
            </div>
            <p className="text-xl font-bold text-foreground mb-1">{formatBitcoin(totalInvestedAmount.toString())}</p>
            <p className="text-xs text-muted-foreground font-medium">BTC</p>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-bitcoin/15 to-bitcoin/5 p-5 rounded-3xl backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-bitcoin/20 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-bitcoin/30 flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-bitcoin" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Profit</span>
            </div>
            <p className="text-xl font-bold text-emerald mb-1">+{formatBitcoin(totalProfit.toString())}</p>
            <p className="text-xs text-muted-foreground font-medium">BTC</p>
          </Card>
        </div>
      </div>

      {/* Current Plan */}
      <div className="relative px-6 mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-flux-cyan to-flux-purple rounded-full"></div>
          Investment Plan
        </h3>
        <Card className="border-0 bg-gradient-to-br from-sapphire/15 via-flux-purple/10 to-flux-blue/15 p-6 rounded-3xl backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                currentPlan 
                  ? 'bg-gradient-to-br from-emerald/30 to-emerald/10' 
                  : 'bg-gradient-to-br from-sapphire/30 to-sapphire/10'
              }`}>
                <Zap className={`w-7 h-7 ${
                  currentPlan ? 'text-emerald' : 'text-sapphire'
                }`} />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-lg">
                  {currentPlan ? currentPlan.name : "Free Plan"}
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  {currentPlan 
                    ? `${(parseFloat(currentPlan.dailyReturnRate) * 100).toFixed(2)}% daily`
                    : "3.67% every 10 min"
                  }
                </p>
              </div>
            </div>
            <Badge className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              currentPlan 
                ? 'bg-emerald/20 text-emerald border-emerald/30' 
                : 'bg-sapphire/20 text-sapphire border-sapphire/30'
            }`} variant="outline">
              {currentPlan ? 'Premium' : 'Free'}
            </Badge>
          </div>
          {!currentPlan && (
            <Button 
              className="w-full bg-gradient-to-r from-flux-cyan via-flux-purple to-flux-blue text-white font-semibold rounded-2xl h-12 hover:shadow-2xl hover:shadow-flux-cyan/30 transition-all hover:scale-105"
              onClick={() => setLocation('/investment')}
            >
              Upgrade Plan
            </Button>
          )}
        </Card>
      </div>

      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <div className="relative px-6 mb-8">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-flux-cyan to-flux-purple rounded-full"></div>
            Active Investments
          </h3>
          <div className="space-y-4">
            {activeInvestments.map((investment) => {
              const progress = calculateInvestmentProgress(
                new Date(investment.startDate),
                new Date(investment.endDate)
              );
              const daysLeft = Math.ceil(
                (new Date(investment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={investment.id} className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md p-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-foreground text-base">Investment #{investment.id}</h4>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {formatDate(new Date(investment.startDate))}
                      </p>
                    </div>
                    <Badge className="bg-emerald/20 text-emerald border-emerald/30 text-xs px-3 py-1 rounded-full animate-pulse" variant="outline">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Invested</span>
                      <span className="text-foreground font-bold">{formatBitcoin(investment.amount)} BTC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Profit</span>
                      <span className="text-emerald font-bold">+{formatBitcoin(investment.currentProfit)} BTC</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2.5 mb-3 rounded-full" />
                  <p className="text-xs text-muted-foreground text-center font-medium">
                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
