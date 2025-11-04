import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Investment, TokenBalance } from "@shared/schema";
import { formatBitcoin } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function BalanceOverview() {
  const { user } = useAuth();

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    enabled: !!user?.id,
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

  if (!user) return null;

  // Calculate total portfolio value from all tokens
  let totalPortfolioValue = 0;
  let avgChange24h = 0;

  if (tokenBalances && tokenPrices) {
    tokenBalances.forEach(balance => {
      const tokenBalance = parseFloat(balance.balance);
      const tokenPrice = tokenPrices[balance.tokenSymbol]?.price || 0;
      totalPortfolioValue += tokenBalance * tokenPrice;
    });

    // Calculate weighted average of 24h changes
    const changes = tokenBalances
      .map(balance => tokenPrices[balance.tokenSymbol]?.change24h || 0)
      .filter(change => change !== 0);
    avgChange24h = changes.length > 0 
      ? changes.reduce((sum, change) => sum + change, 0) / changes.length 
      : 0;
  }

  // Calculate total invested and total profit
  const totalInvestedAmount = investments?.reduce((total, inv) => 
    total + parseFloat(inv.amount), 0
  ) || 0;

  const totalProfit = investments?.reduce((total, inv) => 
    total + parseFloat(inv.currentProfit), 0
  ) || 0;

  // Get wallet balance (BTC balance from user)
  const walletBalance = parseFloat(user.balance);

  // Total assets = wallet balance + portfolio value + total profit
  const totalAssets = walletBalance + totalPortfolioValue + totalProfit;
  const isPositiveChange = avgChange24h >= 0;

  // Get user's first name or email
  const getUserGreeting = () => {
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold neon-text" data-testid="text-greeting">
          Welcome back, {getUserGreeting()} 👋
        </h1>
      </motion.div>

      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card 
          className="neon-card border neon-border neon-glow rounded-2xl overflow-hidden"
          data-testid="card-balance-overview"
        >
          <CardContent className="p-6 relative">
            {/* Background gradient accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 60%) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs neon-text-secondary mb-1" data-testid="text-balance-label">
                    Total Assets
                  </p>
                  <h2 
                    className="text-2xl sm:text-3xl font-bold neon-text mb-1" 
                    data-testid="text-total-assets"
                  >
                    ${totalAssets.toFixed(2)}
                  </h2>
                  {avgChange24h !== 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp 
                        className={`w-4 h-4 ${isPositiveChange ? 'text-emerald' : 'text-ruby rotate-180'}`}
                      />
                      <span 
                        className={`text-sm font-medium ${isPositiveChange ? 'text-emerald' : 'text-ruby'}`}
                        data-testid="text-change-percentage"
                      >
                        {isPositiveChange ? '+' : ''}{avgChange24h.toFixed(2)}% today
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Balance Breakdown */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                <div className="neon-bg rounded-lg p-2 sm:p-3 border neon-border">
                  <p className="text-[10px] sm:text-xs neon-text-secondary mb-0.5">Wallet</p>
                  <p className="font-semibold neon-text text-xs sm:text-sm truncate" data-testid="text-wallet-balance">
                    ${totalAssets.toFixed(2)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] neon-text-secondary">Total Assets</p>
                </div>
                <div className="neon-bg rounded-lg p-2 sm:p-3 border neon-border">
                  <p className="text-[10px] sm:text-xs neon-text-secondary mb-0.5">Invested</p>
                  <p className="font-semibold neon-text text-xs sm:text-sm truncate" data-testid="text-total-invested">
                    ${totalInvestedAmount.toFixed(2)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] neon-text-secondary">USDT</p>
                </div>
                <div className="rounded-lg p-2 sm:p-3 border" style={{ 
                  backgroundColor: 'rgba(0, 255, 128, 0.05)',
                  borderColor: 'rgba(0, 255, 128, 0.2)'
                }}>
                  <p className="text-[10px] sm:text-xs neon-text-secondary mb-0.5">Profit</p>
                  <p className="font-semibold text-emerald text-xs sm:text-sm truncate" data-testid="text-total-profit">
                    +${totalProfit.toFixed(2)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] neon-text-secondary">USDT</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}