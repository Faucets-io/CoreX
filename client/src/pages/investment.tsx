import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { InvestmentPlans } from "@/components/investment-plans";
import { BottomNavigation } from "@/components/bottom-navigation";
import type { Investment, InvestmentPlan, Transaction } from "@shared/schema";
import { formatBitcoin, calculateInvestmentProgress, formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/use-currency";
import { TrendingUp, Target, Clock, Award, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AppLayout } from "@/components/app-layout";

export default function Investment() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user.id],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: plans } = useQuery<InvestmentPlan[]>({
    queryKey: ['/api/investment-plans'],
    refetchOnMount: true,
  });

  const { data: transactions } = useQuery<any[]>({
    queryKey: ['/api/transactions'],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const getPlanName = (planId: number) => {
    return plans?.find(plan => plan.id === planId)?.name || `Plan ${planId}`;
  };

  const activeInvestments = investments?.filter(inv => inv.isActive) || [];
  const completedInvestments = investments?.filter(inv => !inv.isActive) || [];
  const pendingInvestments = transactions?.filter(tx => tx.type === 'investment' && tx.status === 'pending') || [];
  const rejectedInvestments = transactions?.filter(tx => tx.type === 'investment' && tx.status === 'rejected') || [];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
                className="rounded-xl hover:bg-muted/50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-flux-cyan to-flux-purple bg-clip-text text-transparent">
                Investment Plans
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">Grow your Bitcoin with our professional investment plans</p>
          </div>

          {/* Investment Plans */}
          <InvestmentPlans />

          {/* Pending Investments */}
          {pendingInvestments.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-flux-cyan" />
                <h3 className="text-xl font-semibold text-foreground">Pending Investments</h3>
              </div>
              <div className="space-y-4">
                {pendingInvestments.map((transaction) => (
                  <Card key={transaction.id} className="bg-card/50 backdrop-blur border-border/50 rounded-2xl p-5 hover:border-flux-cyan/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{getPlanName(transaction.planId || 1)}</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Submitted: {formatDate(new Date(transaction.createdAt))}
                        </p>
                      </div>
                      <Badge className="bg-flux-cyan/10 text-flux-cyan border-flux-cyan/20 px-3 py-1">
                        Pending
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Investment Amount</span>
                        <span className="text-foreground font-semibold">{formatBitcoin(transaction.amount)} BTC</span>
                      </div>
                      {transaction.transactionHash && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Transaction Hash</span>
                          <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                            {transaction.transactionHash.substring(0, 8)}...{transaction.transactionHash.substring(-8)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-flux-cyan/5 border border-flux-cyan/10 rounded-xl">
                      <p className="text-xs text-muted-foreground">
                        Your investment is pending admin approval and will be activated once confirmed.
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        {/* Rejected Investments */}
          {rejectedInvestments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Rejected Investments</h3>
              <div className="space-y-4">
                {rejectedInvestments.map((transaction) => (
                  <Card key={transaction.id} className="bg-card/30 backdrop-blur border-destructive/20 rounded-2xl p-5 opacity-90">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-destructive text-lg">{getPlanName(transaction.planId || 1)}</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Rejected: {transaction.confirmedAt ? formatDate(new Date(transaction.confirmedAt)) : 'Recently'}
                        </p>
                      </div>
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1">
                        Rejected
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="text-foreground font-semibold">{formatBitcoin(transaction.amount)} BTC</span>
                      </div>
                      {transaction.notes && (
                        <div className="bg-destructive/5 border border-destructive/10 p-3 rounded-xl">
                          <span className="text-destructive font-medium text-sm">Reason: </span>
                          <span className="text-muted-foreground text-sm">{transaction.notes}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        {/* Active Investments */}
          {activeInvestments.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald" />
                <h3 className="text-xl font-semibold text-foreground">Active Investments</h3>
              </div>
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
                    <Card key={investment.id} className="bg-gradient-to-br from-card/50 to-emerald/5 backdrop-blur border-emerald/20 rounded-2xl p-5 hover:border-emerald/40 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-foreground text-lg">{getPlanName(investment.planId)}</h4>
                          <p className="text-muted-foreground text-sm mt-1">
                            Started: {formatDate(new Date(investment.startDate))}
                          </p>
                        </div>
                        <Badge className="bg-emerald/10 text-emerald border-emerald/20 px-3 py-1">
                          Active
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Invested</span>
                          <span className="text-foreground font-semibold">{formatBitcoin(investment.amount)} BTC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current Profit</span>
                          <span className="text-emerald font-semibold">+{formatBitcoin(investment.currentProfit)} BTC</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                          </p>
                          <p className="text-xs text-emerald font-medium">{progress.toFixed(0)}%</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Investments */}
          {completedInvestments.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-flux-purple" />
                <h3 className="text-xl font-semibold text-foreground">Completed Investments</h3>
              </div>
              <div className="space-y-4">
                {completedInvestments.map((investment) => (
                  <Card key={investment.id} className="bg-card/30 backdrop-blur border-border/50 rounded-2xl p-5 opacity-90">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{getPlanName(investment.planId)}</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Completed: {formatDate(new Date(investment.endDate))}
                        </p>
                      </div>
                      <Badge className="bg-muted/50 text-muted-foreground border-border px-3 py-1">
                        Completed
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Invested</span>
                        <span className="text-foreground font-semibold">{formatBitcoin(investment.amount)} BTC</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Final Profit</span>
                        <span className="text-emerald font-semibold">+{formatBitcoin(investment.currentProfit)} BTC</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!investments || investments.length === 0) && pendingInvestments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-flux-cyan/10 to-flux-purple/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-flux-cyan" />
              </div>
              <div className="text-muted-foreground max-w-md mx-auto">
                <p className="text-xl font-semibold mb-2 text-foreground">No investments yet</p>
                <p className="text-sm">Choose an investment plan above to start growing your Bitcoin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}