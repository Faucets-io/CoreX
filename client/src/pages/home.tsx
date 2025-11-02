
import { useAuth } from "@/hooks/use-auth";
import { WalletBalance } from "@/components/wallet-balance";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, User, TrendingUp, Wallet, PieChart, Clock, ArrowDownToLine, ArrowUpFromLine, Plus, History } from "lucide-react";
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
    refetchInterval: 5000, // Faster refresh for instant display
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative" 
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
              variant="outline" 
              size="icon" 
              onClick={() => setLocation('/profile')}
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Wallet Balance */}
        <WalletBalance />

        {/* Quick Action Icons */}
        <div className="grid grid-cols-4 gap-3">
          <button 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:bg-accent transition-colors border border-border"
            onClick={() => setLocation('/deposit')}
          >
            <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center">
              <ArrowDownToLine className="w-6 h-6 text-emerald" />
            </div>
            <span className="text-xs font-medium text-foreground">Deposit</span>
          </button>

          <button 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:bg-accent transition-colors border border-border"
            onClick={() => setLocation('/withdraw')}
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ArrowUpFromLine className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-foreground">Withdraw</span>
          </button>

          <button 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:bg-accent transition-colors border border-border"
            onClick={() => setLocation('/investment')}
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-xs font-medium text-foreground">Invest</span>
          </button>

          <button 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:bg-accent transition-colors border border-border"
            onClick={() => setLocation('/history')}
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <History className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-xs font-medium text-foreground">History</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invested
              </CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBitcoin(totalInvestedAmount.toString())} BTC</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald">+{formatBitcoin(totalProfit.toString())} BTC</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Investments
              </CardTitle>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInvestments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Active Investments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeInvestments.map((investment) => {
                const progress = calculateInvestmentProgress(
                  new Date(investment.startDate),
                  new Date(investment.endDate)
                );
                const daysLeft = Math.ceil(
                  (new Date(investment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={investment.id} className="border border-border rounded-2xl p-4 space-y-3 bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-emerald" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Investment #{investment.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(new Date(investment.startDate))}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald/10 text-emerald border-emerald/30">
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">Invested</p>
                        <p className="font-semibold text-foreground">{formatBitcoin(investment.amount)} BTC</p>
                      </div>
                      <div className="bg-emerald/5 rounded-xl p-3 border border-emerald/20">
                        <p className="text-xs text-muted-foreground mb-1">Profit</p>
                        <p className="font-semibold text-emerald">+{formatBitcoin(investment.currentProfit)} BTC</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Current Plan */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Investment Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">
                  {currentPlan ? currentPlan.name : "Free Plan"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentPlan 
                    ? `${(parseFloat(currentPlan.dailyReturnRate) * 100).toFixed(2)}% daily return`
                    : "3.67% return every 10 minutes"
                  }
                </p>
              </div>
              <Badge variant={currentPlan ? "default" : "secondary"}>
                {currentPlan ? 'Premium' : 'Free'}
              </Badge>
            </div>
            {!currentPlan && (
              <Button 
                className="w-full mt-4"
                onClick={() => setLocation('/investment')}
              >
                Upgrade Plan
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
