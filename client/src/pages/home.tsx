
import { useAuth } from "@/hooks/use-auth";
import { WalletBalance } from "@/components/wallet-balance";
import { AppLayout } from "@/components/app-layout";
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
  const { user } = useAuth();
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
    <AppLayout maxWidth="2xl">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-flux-cyan to-flux-purple bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl relative hover:bg-muted" 
                onClick={() => setLocation('/notifications')}
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount && unreadCount.count > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadCount.count > 9 ? '9+' : unreadCount.count}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl hover:bg-muted" 
                onClick={() => setLocation('/profile')}
                data-testid="button-profile"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

      {/* Wallet Balance - Hero Section */}
      <WalletBalance />

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="h-16 rounded-2xl bg-emerald/10 hover:bg-emerald/20 border border-emerald/20 text-foreground flex flex-col items-center justify-center gap-1 transition-all"
            onClick={() => setLocation('/deposit')}
            variant="outline"
          >
            <ArrowDownLeft className="w-5 h-5 text-emerald" />
            <span className="text-sm font-medium">Deposit</span>
          </Button>
          <Button 
            className="h-16 rounded-2xl bg-ruby/10 hover:bg-ruby/20 border border-ruby/20 text-foreground flex flex-col items-center justify-center gap-1 transition-all"
            onClick={() => setLocation('/withdraw')}
            variant="outline"
          >
            <ArrowUpRight className="w-5 h-5 text-ruby" />
            <span className="text-sm font-medium">Withdraw</span>
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Market Overview</h3>
        <Card className="border-0 bg-gradient-to-br from-flux-cyan/5 to-flux-purple/5 p-5 rounded-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bitcoin/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-bitcoin">₿</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Bitcoin</p>
                  <p className="text-xs text-muted-foreground">BTC</p>
                </div>
              </div>
              <Badge className="bg-emerald/20 text-emerald border-emerald/30 text-xs" variant="outline">
                Live Trading
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Investments</p>
                <p className="text-lg font-bold text-foreground">{activeInvestments.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Return</p>
                <p className="text-lg font-bold text-emerald">+{formatBitcoin(totalProfit.toString())}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Stats */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Portfolio</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-emerald/5 to-emerald/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald" />
              </div>
              <span className="text-xs text-muted-foreground">Invested</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatBitcoin(totalInvestedAmount.toString())}</p>
            <p className="text-xs text-muted-foreground">BTC</p>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-bitcoin/5 to-bitcoin/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-bitcoin/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-bitcoin" />
              </div>
              <span className="text-xs text-muted-foreground">Profit</span>
            </div>
            <p className="text-lg font-bold text-emerald">+{formatBitcoin(totalProfit.toString())}</p>
            <p className="text-xs text-muted-foreground">BTC</p>
          </Card>
        </div>
      </div>

      {/* Current Plan */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Investment Plan</h3>
        <Card className="border-0 bg-gradient-to-br from-sapphire/5 to-flux-purple/5 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                currentPlan 
                  ? 'bg-emerald/20' 
                  : 'bg-sapphire/20'
              }`}>
                <Zap className={`w-6 h-6 ${
                  currentPlan ? 'text-emerald' : 'text-sapphire'
                }`} />
              </div>
              <div>
                <h4 className="font-bold text-foreground">
                  {currentPlan ? currentPlan.name : "Free Plan"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {currentPlan 
                    ? `${(parseFloat(currentPlan.dailyReturnRate) * 100).toFixed(2)}% daily`
                    : "3.67% every 10 min"
                  }
                </p>
              </div>
            </div>
            <Badge className={`px-3 py-1 rounded-lg text-xs ${
              currentPlan 
                ? 'bg-emerald/20 text-emerald border-emerald/30' 
                : 'bg-sapphire/20 text-sapphire border-sapphire/30'
            }`} variant="outline">
              {currentPlan ? 'Premium' : 'Free'}
            </Badge>
          </div>
          {!currentPlan && (
            <Button 
              className="w-full bg-gradient-to-r from-flux-cyan to-flux-purple text-white font-medium rounded-xl h-11 hover:opacity-90 transition-opacity"
              onClick={() => setLocation('/investment')}
            >
              Upgrade Plan
            </Button>
          )}
        </Card>
      </div>

      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Investments</h3>
          <div className="space-y-3">
            {activeInvestments.map((investment) => {
              const progress = calculateInvestmentProgress(
                new Date(investment.startDate),
                new Date(investment.endDate)
              );
              const daysLeft = Math.ceil(
                (new Date(investment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={investment.id} className="border-0 bg-card/50 backdrop-blur-sm p-4 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">Investment #{investment.id}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(new Date(investment.startDate))}
                      </p>
                    </div>
                    <Badge className="bg-emerald/20 text-emerald border-emerald/30 text-xs" variant="outline">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invested</span>
                      <span className="text-foreground font-medium">{formatBitcoin(investment.amount)} BTC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Profit</span>
                      <span className="text-emerald font-medium">+{formatBitcoin(investment.currentProfit)} BTC</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      </div>
    </AppLayout>
  );
}
