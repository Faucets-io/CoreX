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
      <div className="min-h-screen neon-bg">
        {/* Neon Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00FF80]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00CCFF]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 pb-24">
          <div className="max-w-sm mx-auto px-6 pt-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-2">
                Profile
              </h1>
              <p className="text-sm text-gray-400">Manage your account</p>
            </div>

            {/* Profile Card with Balance */}
            <div
              className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#2A2A2A]"
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
                onClick={handleLogout}
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
      </div>
    </AppLayout>
  );
}