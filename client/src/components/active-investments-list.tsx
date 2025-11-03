import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Investment, InvestmentPlan } from "@shared/schema";
import { formatBitcoin, calculateInvestmentProgress, formatDate } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function ActiveInvestmentsList() {
  const { user } = useAuth();

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const { data: investmentPlans } = useQuery<InvestmentPlan[]>({
    queryKey: ['/api/investment-plans'],
    enabled: !!user,
  });

  if (!user) return null;

  const activeInvestments = investments?.filter(inv => inv.isActive) || [];

  const getPlanName = (planId: number) => {
    const plan = investmentPlans?.find(p => p.id === planId);
    return plan ? plan.name : `Plan #${planId}`;
  };

  if (activeInvestments.length === 0) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xl font-semibold neon-text mb-4"
        data-testid="heading-active-investments"
      >
        Active Investments
      </motion.h2>

      <div className="space-y-4 overflow-x-auto pb-2">
        <div className="flex gap-4 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {activeInvestments.map((investment, index) => {
            const progress = calculateInvestmentProgress(
              new Date(investment.startDate),
              new Date(investment.endDate)
            );
            const daysLeft = Math.ceil(
              (new Date(investment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.05 }}
                className="min-w-[280px] sm:min-w-0"
              >
                <Card 
                  className="neon-card border rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
                  style={{
                    borderColor: 'rgba(0, 255, 128, 0.2)',
                    boxShadow: '0 0 15px rgba(0, 255, 128, 0.1)',
                  }}
                  data-testid={`card-investment-${investment.id}`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(0, 255, 128, 0.1)' }}
                        >
                          <TrendingUp className="w-5 h-5 text-emerald" />
                        </div>
                        <div>
                          <h4 className="font-semibold neon-text" data-testid={`text-investment-name-${investment.id}`}>
                            {getPlanName(investment.planId)}
                          </h4>
                          <p className="text-xs neon-text-secondary" data-testid={`text-investment-date-${investment.id}`}>
                            {formatDate(new Date(investment.startDate))}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="border text-emerald"
                        style={{
                          backgroundColor: 'rgba(0, 255, 128, 0.1)',
                          borderColor: 'rgba(0, 255, 128, 0.3)',
                        }}
                        data-testid={`badge-status-${investment.id}`}
                      >
                        Active
                      </Badge>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="neon-bg rounded-xl p-3 border neon-border">
                        <p className="text-xs neon-text-secondary mb-1">Invested</p>
                        <p className="font-semibold neon-text text-sm break-all" data-testid={`text-amount-${investment.id}`}>
                          {formatBitcoin(investment.amount)} USDT
                        </p>
                      </div>
                      <div 
                        className="rounded-xl p-3 border"
                        style={{ 
                          backgroundColor: 'rgba(0, 255, 128, 0.05)',
                          borderColor: 'rgba(0, 255, 128, 0.2)'
                        }}
                      >
                        <p className="text-xs neon-text-secondary mb-1">Profit</p>
                        <p className="font-semibold text-emerald text-sm break-all" data-testid={`text-profit-${investment.id}`}>
                          +{formatBitcoin(investment.currentProfit)} USDT
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="neon-text-secondary">Progress</span>
                        <span className="font-medium neon-text" data-testid={`text-progress-${investment.id}`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2"
                        style={{
                          backgroundColor: 'rgba(0, 255, 128, 0.1)',
                        }}
                      />
                      <p className="text-xs neon-text-secondary text-center" data-testid={`text-days-left-${investment.id}`}>
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
