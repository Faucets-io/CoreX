
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TokenBalance, TokenAddress } from '@shared/schema';
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Copy, Eye, EyeOff, ArrowDownUp, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';

const TOKEN_LOGO_URLS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  TRUMP: 'https://assets.coingecko.com/coins/images/41446/large/photo_2025-01-18_03-57-00.jpg'
};

function TokenIcon({ symbol, size = 'md' }: { symbol: string; size?: 'sm' | 'md' | 'lg' }) {
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setImageError(false);
  }, [symbol]);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const logoUrl = TOKEN_LOGO_URLS[symbol];
  
  if (!logoUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center`}>
        <span className="text-2xl">💎</span>
      </div>
    );
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={symbol} 
      className={`${sizeClasses[size]} rounded-full object-cover`}
      onError={() => setImageError(true)}
    />
  );
}

export default function Assets() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddresses, setShowAddresses] = useState<Record<string, boolean>>({});
  const [showSwap, setShowSwap] = useState(false);
  const [fromToken, setFromToken] = useState<string>('BTC');
  const [toToken, setToToken] = useState<string>('ETH');
  const [fromAmount, setFromAmount] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  const { data: tokenBalances, isLoading: balancesLoading } = useQuery<TokenBalance[]>({
    queryKey: [`/api/token-balances/${user?.id}`],
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const { data: tokenAddresses, isLoading: addressesLoading } = useQuery<TokenAddress[]>({
    queryKey: [`/api/token-addresses/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: tokenPrices } = useQuery<Record<string, { price: number; change24h: number }>>({
    queryKey: ['/api/token-prices'],
    refetchInterval: 30000,
  });

  const swapMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/token-swap', {
        userId: user?.id,
        fromToken,
        toToken,
        fromAmount
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Swap Successful!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/token-balances/${user?.id}`] });
      setFromAmount('');
      setShowSwap(false);
    },
    onError: (error: any) => {
      toast({
        title: "Swap Failed",
        description: error.message || "Failed to execute swap",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleAddressVisibility = (token: string) => {
    setShowAddresses(prev => ({ ...prev, [token]: !prev[token] }));
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const totalValueUSD = tokenBalances?.reduce((total, balance) => {
    const tokenBalance = parseFloat(balance.balance);
    const tokenPrice = tokenPrices?.[balance.tokenSymbol]?.price || 0;
    return total + (tokenBalance * tokenPrice);
  }, 0) || 0;

  const availableTokens = tokenBalances?.filter(b => parseFloat(b.balance) > 0).map(b => b.tokenSymbol) || [];

  const calculateSwapAmount = () => {
    if (!fromAmount || !tokenPrices || parseFloat(fromAmount) <= 0) return 0;
    
    const fromPrice = tokenPrices[fromToken]?.price || 0;
    const toPrice = tokenPrices[toToken]?.price || 0;
    
    if (fromPrice === 0 || toPrice === 0) return 0;
    
    const fromAmountNum = parseFloat(fromAmount);
    const exchangeRate = fromPrice / toPrice;
    return fromAmountNum * exchangeRate;
  };

  const estimatedReceive = calculateSwapAmount();
  const fromPrice = tokenPrices?.[fromToken]?.price || 0;
  const toPrice = tokenPrices?.[toToken]?.price || 0;
  const exchangeRate = fromPrice && toPrice ? fromPrice / toPrice : 0;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your cryptocurrency holdings</p>
        </header>

        {/* Portfolio Overview Card - Matching home.tsx style */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-purple/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                <h2 className="text-4xl font-bold text-foreground">
                  ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Across {tokenBalances?.filter(b => parseFloat(b.balance) > 0).length || 0} tokens
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button
                  onClick={() => setShowSwap(!showSwap)}
                  variant={showSwap ? "default" : "outline"}
                  className="gap-2"
                >
                  <ArrowDownUp className="w-4 h-4" />
                  Swap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Swap Toggle for Mobile */}
        <div className="md:hidden">
          <Button
            onClick={() => setShowSwap(!showSwap)}
            variant={showSwap ? "default" : "outline"}
            className="w-full gap-2"
          >
            <ArrowDownUp className="w-4 h-4" />
            {showSwap ? 'Hide Swap' : 'Swap Tokens'}
          </Button>
        </div>

        {/* Swap Section */}
        {showSwap && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowDownUp className="w-5 h-5 text-flux-cyan" />
                Swap Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From</label>
                <div className="flex gap-2">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-32" data-testid="select-from-token">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={fromToken} size="sm" />
                          <span>{fromToken}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map(token => (
                        <SelectItem key={token} value={token}>
                          <div className="flex items-center gap-2">
                            <TokenIcon symbol={token} size="sm" />
                            <span>{token}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    data-testid="input-from-amount"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: {tokenBalances?.find(b => b.tokenSymbol === fromToken)?.balance || '0'}
                </p>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowDownUp className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">To</label>
                <div className="flex gap-2">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-32" data-testid="select-to-token">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={toToken} size="sm" />
                          <span>{toToken}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {['BTC', 'ETH', 'BNB', 'USDT', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRUMP'].map(token => (
                        <SelectItem key={token} value={token}>
                          <div className="flex items-center gap-2">
                            <TokenIcon symbol={token} size="sm" />
                            <span>{token}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={estimatedReceive > 0 ? estimatedReceive.toFixed(8) : ''}
                    readOnly
                    data-testid="output-to-amount"
                    className="flex-1 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: {tokenBalances?.find(b => b.tokenSymbol === toToken)?.balance || '0'}
                </p>
              </div>

              {/* Exchange Rate Info */}
              {fromAmount && parseFloat(fromAmount) > 0 && tokenPrices && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="text-foreground font-medium">
                      1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold pt-1.5 border-t border-border">
                    <span className="text-foreground">You'll receive</span>
                    <span className="text-flux-cyan">{estimatedReceive.toFixed(8)} {toToken}</span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={() => swapMutation.mutate()}
                disabled={!fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken || swapMutation.isPending}
                className="w-full bg-gradient-to-r from-flux-cyan to-flux-purple hover:opacity-90"
                data-testid="button-swap"
              >
                {swapMutation.isPending ? 'Swapping...' : 'Swap Tokens'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Token Balances */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Token Balances</h2>
          
          {balancesLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading balances...</div>
          ) : !tokenBalances || tokenBalances.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No token balances found</p>
                <p className="text-sm text-muted-foreground mt-2">Create a wallet to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tokenBalances.map((balance) => {
                const address = tokenAddresses?.find(a => a.token === balance.tokenSymbol);
                const isVisible = showAddresses[balance.tokenSymbol];
                const tokenPrice = tokenPrices?.[balance.tokenSymbol]?.price || 0;
                const tokenValue = parseFloat(balance.balance) * tokenPrice;
                
                return (
                  <Card key={balance.id} className="border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TokenIcon symbol={balance.tokenSymbol} size="md" />
                          <div>
                            <h4 className="font-semibold text-foreground">{balance.tokenSymbol}</h4>
                            <p className="text-xs text-muted-foreground">
                              ${tokenValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground" data-testid={`balance-${balance.tokenSymbol}`}>
                            {parseFloat(balance.balance).toLocaleString(undefined, { 
                              minimumFractionDigits: balance.tokenSymbol === 'USDT' ? 2 : 6,
                              maximumFractionDigits: balance.tokenSymbol === 'USDT' ? 2 : 6
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      {address && (
                        <div className="bg-muted/30 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-muted-foreground">Address</p>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleAddressVisibility(balance.tokenSymbol)}
                                data-testid={`toggle-address-${balance.tokenSymbol}`}
                              >
                                {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(address.address, `${balance.tokenSymbol} address`)}
                                data-testid={`copy-address-${balance.tokenSymbol}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs font-mono">
                            {isVisible ? address.address : truncateAddress(address.address)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
