import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { useCurrency } from "@/hooks/use-currency";
import { formatBitcoin, btcToUsd, formatUsd, calculateCurrencyValue } from "@/lib/utils";
import { Eye, EyeOff, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TokenBalance } from "@shared/schema";

export function WalletBalance() {
  const { user } = useAuth();
  const { data: bitcoinPrice } = useBitcoinPrice();
  const { currency } = useCurrency();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

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

  const priceData = bitcoinPrice ? (currency === 'USD' ? bitcoinPrice.usd : bitcoinPrice.gbp) : null;
  const btcAmount = parseFloat(user.balance);
  
  // Calculate total portfolio value from all tokens
  let totalPortfolioValue = 0;
  
  if (tokenBalances && tokenPrices) {
    tokenBalances.forEach(balance => {
      const tokenBalance = parseFloat(balance.balance);
      const tokenPrice = tokenPrices[balance.tokenSymbol]?.price || 0;
      totalPortfolioValue += tokenBalance * tokenPrice;
    });
  } else {
    // Fallback to BTC balance if token data not loaded
    totalPortfolioValue = priceData?.price ? btcToUsd(btcAmount, priceData.price) : 0;
  }
  
  const usdValue = totalPortfolioValue;
  const btcEquivalent = priceData?.price ? (totalPortfolioValue / priceData.price) : btcAmount;

  return (
    <div className="px-6 mb-8">
      <Card className="gradient-primary rounded-3xl p-8 relative overflow-hidden border-0 shadow-2xl animate-glow">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white dark:bg-white opacity-10 rounded-full -translate-y-20 translate-x-20 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white dark:bg-white opacity-5 rounded-full translate-y-16 -translate-x-16 animate-float"></div>

        {/* Security indicators */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white bg-opacity-20 dark:bg-opacity-20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white dark:text-white" />
          </div>
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white bg-opacity-20 dark:bg-opacity-20 flex items-center justify-center animate-pulse">
            <Zap className="w-4 h-4 text-white dark:text-white" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-black text-opacity-70 text-sm font-medium mb-1">Total Portfolio Balance</p>
              <div className="flex items-center gap-3">
                {isBalanceVisible ? (
                  <h2 className="text-4xl font-bold text-black tracking-tight">
                    {formatUsd(usdValue)}
                  </h2>
                ) : (
                  <h2 className="text-4xl font-bold text-black tracking-tight">
                    ••••••••
                  </h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-xl bg-black bg-opacity-10 hover:bg-opacity-20 transition-all"
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                >
                  {isBalanceVisible ? (
                    <EyeOff className="w-4 h-4 text-black" />
                  ) : (
                    <Eye className="w-4 h-4 text-black" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {isBalanceVisible && (
            <p className="text-black text-opacity-70 text-xl font-semibold mb-6">
              {formatBitcoin(btcEquivalent.toString())} BTC
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-black border-opacity-20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald animate-pulse"></div>
              <p className="text-black text-opacity-70 text-sm font-medium">
                Secure Vault • Multi-Sig Protected
              </p>
            </div>
            <div className="text-right">
              <p className="text-black text-opacity-70 text-xs">Last Updated</p>
              <p className="text-black text-sm font-medium">Just now</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}