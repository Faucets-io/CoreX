
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AppLayout } from "@/components/app-layout";
import { Copy, User, ArrowLeft, TrendingUp, Activity, Calendar, Mail, Award, Wallet, Eye, EyeOff, LogOut, Shield, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/use-currency";
import { formatBitcoin, formatCurrency } from "@/lib/utils";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { useQuery } from "@tanstack/react-query";
import type { Investment, Transaction } from "@shared/schema";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { currency } = useCurrency();
  const { data: price } = useBitcoinPrice();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    enabled: !!user?.id,
    refetchInterval: 30000,
    initialData: [],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
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
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  };

  const fiatValue = parseFloat(user.balance) * (currency === 'USD' ? (price?.usd.price || 0) : (price?.gbp.price || 0));
  const totalInvested = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const totalProfit = investments?.reduce((sum, inv) => sum + parseFloat(inv.currentProfit), 0) || 0;
  const activeInvestments = investments?.filter(inv => inv.isActive).length || 0;
  const completedInvestments = investments?.filter(inv => !inv.isActive).length || 0;
  const userTransactions = transactions?.filter(tx => tx.userId === user.id).length || 0;

  const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-sm mx-auto px-6 pb-24">
          {/* Profile Header with Balance */}
          <Card className="mt-6 mb-6 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-emerald/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{user.email.split('@')[0]}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                </div>
                {showSensitiveInfo ? (
                  <>
                    <h2 className="text-4xl font-bold text-foreground tracking-tight">
                      {formatBitcoin(user.balance)} BTC
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                      ≈ {price ? formatCurrency(fiatValue, currency) : 'Loading...'}
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
            </CardContent>
          </Card>

          {/* Investment Statistics */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                Investment Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Activity className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <p className="text-lg font-bold text-foreground">{activeInvestments}</p>
                  <p className="text-xs text-muted-foreground">Active Plans</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Award className="w-5 h-5 mx-auto mb-2 text-green-500" />
                  <p className="text-lg font-bold text-foreground">{completedInvestments}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">Total Invested</span>
                  <span className="font-semibold text-foreground">{formatBitcoin(totalInvested.toString())} BTC</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <span className="text-sm text-muted-foreground">Total Profit</span>
                  <span className="font-semibold text-green-500">+{formatBitcoin(totalProfit.toString())} BTC</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">Portfolio Value</span>
                  <span className="font-bold text-primary">{formatBitcoin((totalInvested + totalProfit).toString())} BTC</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{user.email}</span>
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

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Member Since</span>
                </div>
                <span className="text-sm text-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Security Level</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20">
                  High Security
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href="/settings">
              <Button variant="outline" className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/5">
                <User className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
