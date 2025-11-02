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
    <Card className="mx-6 mb-6 border-border rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-card via-card to-accent/20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-muted-foreground text-sm font-medium">Total Portfolio Balance</p>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 rounded-lg hover:bg-accent"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                {isBalanceVisible ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            <div className="space-y-1">
              {isBalanceVisible ? (
                <>
                  <h2 className="text-4xl font-bold text-foreground tracking-tight">
                    {formatUsd(usdValue)}
                  </h2>
                  <p className="text-muted-foreground text-lg font-medium">
                    {formatBitcoin(btcEquivalent.toString())} BTC
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-bold text-foreground tracking-tight">
                    ••••••••
                  </h2>
                  <p className="text-muted-foreground text-lg font-medium">
                    •••••• BTC
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
            <p className="text-muted-foreground text-xs font-medium">
              Secured • Multi-Sig Protected
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Updated now</p>
          </div>
        </div>
      </div>
    </Card>
  );
}