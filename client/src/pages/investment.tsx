import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Investment, InvestmentPlan, Transaction, User } from "@shared/schema";
import { formatBitcoin, formatDate } from "@/lib/utils";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, ChevronDown, ArrowLeft, BookOpen, TrendingUp, MoreHorizontal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";

export default function Investment() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  if (!user) {
    setLocation('/login');
    return null;
  }

  // Fetch user data to get balance
  const { data: userData } = useQuery<User>({
    queryKey: ['/api/user'],
    refetchInterval: 5000,
  });

  // Fetch USDT balance from token balances
  const { data: tokenBalances } = useQuery<any[]>({
    queryKey: [`/api/token-balances/${user.id}`],
    refetchInterval: 5000,
  });

  const { data: investments, refetch: refetchInvestments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user.id],
    refetchInterval: 5000,
    refetchOnMount: true,
  });

  const { data: plans } = useQuery<InvestmentPlan[]>({
    queryKey: ['/api/investment-plans'],
    refetchOnMount: true,
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    refetchInterval: 5000,
    refetchOnMount: true,
  });

  // Vanta.js Globe Effect
  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        GLOBE({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x00ff99,
          color2: 0x00cc66,
          backgroundColor: 0x0a0a0a,
          size: 1.5,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const createInvestmentMutation = useMutation({
    mutationFn: async ({ amount, duration }: { amount: string; duration: number }) => {
      // Find a plan with matching duration or use the first plan
      const plan = plans?.find(p => p.durationDays === duration) || plans?.[0];
      if (!plan) throw new Error('No investment plan available');

      return await apiRequest('POST', '/api/invest', {
        planId: plan.id,
        amount,
        userId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments/user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setAmount("");
      toast({
        title: "✓ Investment Submitted",
        description: "Your investment has been submitted and is pending confirmation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to create investment",
        variant: "destructive",
      });
    },
  });

  // Get USDT balance
  const usdtBalance = tokenBalances?.find(b => b.tokenSymbol === 'USDT')?.balance || '0';

  const handleMaxClick = () => {
    if (usdtBalance) {
      setAmount(usdtBalance);
    }
  };

  const handleStartInvestment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      });
      return;
    }

    // Check minimum investment amount ($500)
    if (parseFloat(amount) < 500) {
      toast({
        title: "Below Minimum",
        description: "Minimum investment amount is $500 USDT",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient USDT balance
    const investmentAmount = parseFloat(amount);
    const availableUSDT = parseFloat(usdtBalance);

    if (investmentAmount > availableUSDT) {
      toast({
        variant: "destructive",
        title: "⚠️ Insufficient USDT Balance",
        description: `You need ${investmentAmount.toFixed(2)} USDT but only have ${availableUSDT.toFixed(2)} USDT available. Please deposit more USDT to start this investment.`,
      });
      return;
    }

    createInvestmentMutation.mutate({
      amount,
      duration: selectedDuration,
    });
  };

  const handleRefresh = () => {
    refetchInvestments();
    toast({
      title: "Refreshed",
      description: "Investment data has been refreshed",
    });
  };

  const durations = [
    { days: 1, rate: 40, totalReturn: 40 },
    { days: 7, rate: 11.428571, totalReturn: 80 },
    { days: 14, rate: 11.428571, totalReturn: 160 },
    { days: 28, rate: 12.142857, totalReturn: 340 },
    { days: 60, rate: 11.333333, totalReturn: 680 },
    { days: 90, rate: 15.111111, totalReturn: 1360 },
    { days: 180, rate: 15.111111, totalReturn: 2720 },
    { days: 360, rate: 15.111111, totalReturn: 5440 }
  ];

  const activeInvestments = investments?.filter(inv => inv.isActive) || [];
  const completedInvestments = investments?.filter(inv => !inv.isActive) || [];
  const pendingInvestments = transactions?.filter(tx => tx.type === 'investment' && tx.status === 'pending') || [];

  const getPlanName = (planId: number) => {
    return plans?.find(plan => plan.id === planId)?.name || `Plan ${planId}`;
  };

  // Calculate investment returns in real-time
  const calculateReturns = () => {
    const investmentAmount = parseFloat(amount) || 0;
    const selectedDurationData = durations.find(d => d.days === selectedDuration);
    const dailyRate = selectedDurationData?.rate || 0;

    const dailyProfit = (investmentAmount * dailyRate) / 100;
    const totalReturnPercentage = dailyRate * selectedDuration;
    const totalProfit = (investmentAmount * totalReturnPercentage) / 100;

    return {
      dailyRate,
      dailyProfit,
      totalReturnPercentage,
      totalProfit,
      totalReturn: investmentAmount + totalProfit
    };
  };

  const returns = calculateReturns();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/home')}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-white/10"
              style={{ color: '#00FF99' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-2xl font-bold" style={{ 
              background: 'linear-gradient(90deg, #00FF99, #00CC66)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              FluxTrade
            </div>
          </div>
          <Button 
            onClick={handleStartInvestment}
            disabled={createInvestmentMutation.isPending}
            className="rounded-full px-6 py-2 font-medium border-0 hover:scale-105 transition-transform"
            style={{ 
              background: 'linear-gradient(90deg, #00FF99, #00CC66)',
              color: '#0A0A0A',
              boxShadow: '0 0 20px rgba(0, 255, 153, 0.3)'
            }}
            data-testid="button-start-investment"
          >
            {createInvestmentMutation.isPending ? 'Processing...' : 'Start'}
          </Button>
        </div>
      </header>

      {/* Hero Section with Globe Animation */}
      <section className="relative h-[400px] overflow-hidden">
        <div ref={vantaRef} className="absolute inset-0" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="text-4xl md:text-5xl font-bold mb-4" style={{ 
            background: 'linear-gradient(90deg, #00FF99, #00CC66)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FluxTrade
          </div>
          <p className="text-lg mb-8" style={{ color: '#BFBFBF' }}>
            Invest Smart. Earn Daily.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              variant="outline" 
              className="rounded-full border-2 hover:scale-105 transition-all duration-300 group"
              style={{ 
                borderColor: '#00FF99',
                color: '#00FF99',
                backgroundColor: 'transparent',
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.2)'
              }}
              data-testid="button-how-to-invest"
              onClick={() => setLocation('/how-to-invest')}
            >
              <BookOpen className="mr-2 w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              How to Invest
            </Button>
            <Button 
              variant="outline"
              className="rounded-full border-2 hover:scale-105 transition-all duration-300 group"
              style={{ 
                borderColor: '#00FF99',
                color: '#00FF99',
                backgroundColor: 'transparent',
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.2)'
              }}
              data-testid="button-profit-plans"
              onClick={() => setLocation('/profit-plans')}
            >
              <TrendingUp className="mr-2 w-4 h-4 group-hover:translate-y-[-2px] transition-transform duration-300" />
              Profit Plans
            </Button>
            <Button 
              variant="outline"
              className="rounded-full border-2 hover:scale-105 transition-all duration-300 group"
              style={{ 
                borderColor: '#00FF99',
                color: '#00FF99',
                backgroundColor: 'transparent',
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.2)'
              }}
              data-testid="button-more"
              onClick={() => setLocation('/investment-more')}
            >
              <MoreHorizontal className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              More
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Investment Card */}
        <Card 
          className="rounded-2xl border overflow-hidden"
          style={{ 
            backgroundColor: '#1A1A1A',
            borderColor: '#2A2A2A',
            boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)'
          }}
        >
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              Investment Options
            </h2>

            {/* Amount Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm" style={{ color: '#BFBFBF' }}>Amount</Label>
                <span className="text-sm" style={{ color: '#BFBFBF' }}>
                  Balance: {parseFloat(usdtBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg border flex-1"
                  style={{ 
                    backgroundColor: '#0A0A0A',
                    borderColor: '#2A2A2A',
                    color: '#FFFFFF'
                  }}
                  data-testid="input-amount"
                />
                <Button
                  onClick={handleMaxClick}
                  variant="outline"
                  className="rounded-lg border"
                  style={{ 
                    borderColor: '#00FF99',
                    color: '#00FF99',
                    backgroundColor: 'transparent'
                  }}
                  data-testid="button-max"
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="mb-6">
              <Label className="text-sm mb-3 block" style={{ color: '#BFBFBF' }}>Duration</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {durations.map((d) => (
                  <Button
                    key={d.days}
                    onClick={() => setSelectedDuration(d.days)}
                    className="rounded-lg transition-all"
                    style={selectedDuration === d.days ? {
                      background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                      color: '#0A0A0A',
                      boxShadow: '0 0 15px rgba(0, 255, 153, 0.3)'
                    } : {
                      backgroundColor: '#0A0A0A',
                      borderColor: '#2A2A2A',
                      color: '#BFBFBF',
                      border: '1px solid #2A2A2A'
                    }}
                    data-testid={`button-duration-${d.days}`}
                  >
                    <span className="font-semibold">{d.days} Day{d.days > 1 ? 's' : ''}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Real-time Calculation Display */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mb-6 p-5 rounded-lg border" style={{ 
                backgroundColor: '#0A0A0A',
                borderColor: '#00FF99',
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.2)'
              }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#00FF99' }}>
                  Investment Projection
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: '#BFBFBF' }}>Investment Amount</span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {formatBitcoin(amount)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: '#BFBFBF' }}>Duration</span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {selectedDuration} day{selectedDuration > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: '#2A2A2A' }} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: '#BFBFBF' }}>Total Return Rate</span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }} data-testid="text-total-rate">
                      {durations.find(d => d.days === selectedDuration)?.totalReturn.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: '#BFBFBF' }}>Estimated Profit</span>
                    <span className="font-bold text-lg" style={{ color: '#00FF99' }} data-testid="text-total-profit">
                      +{returns.totalProfit.toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid #2A2A2A' }}>
                    <span className="text-sm font-semibold" style={{ color: '#BFBFBF' }}>Total Return</span>
                    <span className="font-bold text-xl" style={{ color: '#00FF99' }} data-testid="text-total-return">
                      {returns.totalReturn.toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Summary when no amount */}
            {(!amount || parseFloat(amount) <= 0) && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#0A0A0A' }}>
                <p className="text-sm text-center" style={{ color: '#BFBFBF' }}>
                  Enter an amount to see estimated returns
                </p>
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={handleStartInvestment}
              disabled={createInvestmentMutation.isPending}
              className="w-full rounded-lg py-6 text-lg font-semibold hover:scale-[1.02] transition-transform"
              style={{ 
                background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                color: '#0A0A0A',
                boxShadow: '0 0 20px rgba(0, 255, 153, 0.3)'
              }}
              data-testid="button-start-invest"
            >
              {createInvestmentMutation.isPending ? 'Processing...' : 'Start'}
            </Button>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              My Investments
            </h2>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="rounded-lg border"
              style={{ 
                borderColor: '#00FF99',
                color: '#00FF99',
                backgroundColor: 'transparent',
                boxShadow: '0 0 10px rgba(0, 255, 153, 0.2)'
              }}
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {/* Pending Investments */}
            {pendingInvestments.map((tx) => (
              <Card 
                key={tx.id}
                className="rounded-lg border"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold" style={{ color: '#FFFFFF' }} data-testid={`text-plan-name-pending-${tx.id}`}>
                        {getPlanName(tx.planId || 1)}
                      </p>
                      <p className="text-sm" style={{ color: '#BFBFBF' }} data-testid={`text-date-pending-${tx.id}`}>
                        {formatDate(new Date(tx.createdAt))}
                      </p>
                    </div>
                    <Badge 
                      className="rounded-full px-3 py-1"
                      style={{ 
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        color: '#FFC107',
                        border: '1px solid rgba(255, 193, 7, 0.3)'
                      }}
                      data-testid={`badge-status-pending-${tx.id}`}
                    >
                      Pending
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: '#BFBFBF' }}>Amount</span>
                    <span style={{ color: '#FFFFFF' }} data-testid={`text-amount-pending-${tx.id}`}>{formatBitcoin(tx.amount)} USDT</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Active Investments */}
            {activeInvestments.map((inv) => {
              const daysLeft = Math.ceil(
                (new Date(inv.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card 
                  key={inv.id}
                  className="rounded-lg border"
                  style={{ 
                    backgroundColor: '#1A1A1A',
                    borderColor: '#2A2A2A'
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold" style={{ color: '#FFFFFF' }} data-testid={`text-plan-name-active-${inv.id}`}>
                          {getPlanName(inv.planId)}
                        </p>
                        <p className="text-sm" style={{ color: '#BFBFBF' }} data-testid={`text-days-remaining-active-${inv.id}`}>
                          {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                        </p>
                      </div>
                      <Badge 
                        className="rounded-full px-3 py-1"
                        style={{ 
                          backgroundColor: 'rgba(0, 255, 153, 0.2)',
                          color: '#00FF99',
                          border: '1px solid rgba(0, 255, 153, 0.3)'
                        }}
                        data-testid={`badge-status-active-${inv.id}`}
                      >
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: '#BFBFBF' }}>Amount</span>
                        <span style={{ color: '#FFFFFF' }} data-testid={`text-amount-active-${inv.id}`}>{formatBitcoin(inv.amount)} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: '#BFBFBF' }}>Profit</span>
                        <span style={{ color: '#00FF99' }} data-testid={`text-profit-active-${inv.id}`}>+{formatBitcoin(inv.currentProfit)} USDT</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Completed Investments */}
            {completedInvestments.map((inv) => (
              <Card 
                key={inv.id}
                className="rounded-lg border opacity-80"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold" style={{ color: '#FFFFFF' }} data-testid={`text-plan-name-completed-${inv.id}`}>
                        {getPlanName(inv.planId)}
                      </p>
                      <p className="text-sm" style={{ color: '#BFBFBF' }} data-testid={`text-date-completed-${inv.id}`}>
                        Completed: {formatDate(new Date(inv.endDate))}
                      </p>
                    </div>
                    <Badge 
                      className="rounded-full px-3 py-1"
                      style={{ 
                        backgroundColor: 'rgba(128, 128, 128, 0.2)',
                        color: '#BFBFBF',
                        border: '1px solid rgba(128, 128, 128, 0.3)'
                      }}
                      data-testid={`badge-status-completed-${inv.id}`}
                    >
                      Completed
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: '#BFBFBF' }}>Amount</span>
                      <span style={{ color: '#FFFFFF' }} data-testid={`text-amount-completed-${inv.id}`}>{formatBitcoin(inv.amount)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: '#BFBFBF' }}>Profit</span>
                      <span style={{ color: '#00FF99' }} data-testid={`text-profit-completed-${inv.id}`}>+{formatBitcoin(inv.currentProfit)} USDT</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {!pendingInvestments.length && !activeInvestments.length && !completedInvestments.length && (
              <Card 
                className="rounded-lg border"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A'
                }}
              >
                <CardContent className="p-8 text-center">
                  <p style={{ color: '#BFBFBF' }} data-testid="text-empty-state">No investments yet. Start investing to see your portfolio here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}