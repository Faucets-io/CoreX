import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TokenBalance, TokenAddress } from '@shared/schema';
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Copy, Eye, EyeOff, ArrowDownUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

const TOKEN_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  BNB: '🔸',
  USDT: '₮',
  SOL: '◎',
  XRP: 'X',
  ADA: '₳',
  DOGE: 'Ð',
  TRUMP: '🇺🇸'
};

export default function Assets() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddresses, setShowAddresses] = useState<Record<string, boolean>>({});
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

  // Calculate total portfolio value in USDT
  const totalValueUSDT = tokenBalances?.reduce((total, balance) => {
    // For simplicity, we're just summing USDT and approximate values
    // In a real app, you'd fetch current prices for each token
    if (balance.tokenSymbol === 'USDT') {
      return total + parseFloat(balance.balance);
    }
    return total;
  }, 0) || 0;

  const availableTokens = tokenBalances?.filter(b => parseFloat(b.balance) > 0).map(b => b.tokenSymbol) || [];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your cryptocurrency holdings</p>
        </header>

        {/* Portfolio Overview */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-purple/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                <h2 className="text-4xl font-bold text-foreground">
                  ${totalValueUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="hidden md:flex gap-2">
                <Badge variant="outline" className="text-emerald">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Balances and Swap */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances" data-testid="tab-balances">
              <Wallet className="w-4 h-4 mr-2" />
              Balances
            </TabsTrigger>
            <TabsTrigger value="swap" data-testid="tab-swap">
              <ArrowDownUp className="w-4 h-4 mr-2" />
              Swap
            </TabsTrigger>
          </TabsList>

          {/* Token Balances Tab */}
          <TabsContent value="balances" className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Token Balances</h2>
          
          {balancesLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading balances...</div>
          ) : !tokenBalances || tokenBalances.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No token balances found</p>
                <p className="text-sm text-muted-foreground mt-2">Create a wallet to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokenBalances.map((balance) => {
                const address = tokenAddresses?.find(a => a.token === balance.tokenSymbol);
                const isVisible = showAddresses[balance.tokenSymbol];
                
                return (
                  <Card key={balance.id} className="bg-card border-border hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl">{TOKEN_ICONS[balance.tokenSymbol] || '💎'}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{balance.tokenSymbol}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {balance.tokenSymbol === 'BTC' ? 'Bitcoin' :
                               balance.tokenSymbol === 'ETH' ? 'Ethereum' :
                               balance.tokenSymbol === 'USDT' ? 'Tether' :
                               balance.tokenSymbol}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Balance */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Balance</p>
                        <p className="text-2xl font-bold text-foreground" data-testid={`balance-${balance.tokenSymbol}`}>
                          {parseFloat(balance.balance).toLocaleString(undefined, { 
                            minimumFractionDigits: balance.tokenSymbol === 'USDT' ? 2 : 8,
                            maximumFractionDigits: balance.tokenSymbol === 'USDT' ? 2 : 8
                          })}
                        </p>
                      </div>

                      {/* Address */}
                      {address && (
                        <div>
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
                          <p className="text-xs font-mono bg-accent/50 p-2 rounded">
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
          </TabsContent>

          {/* Swap Tab */}
          <TabsContent value="swap" className="space-y-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownUp className="w-5 h-5 text-flux-cyan" />
                  Swap Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Token */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">From</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={fromToken} onValueChange={setFromToken}>
                      <SelectTrigger data-testid="select-from-token">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map(token => (
                          <SelectItem key={token} value={token}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{TOKEN_ICONS[token] || '💎'}</span>
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
                      className="text-right"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Balance: {tokenBalances?.find(b => b.tokenSymbol === fromToken)?.balance || '0'}
                  </p>
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowDownUp className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">To</label>
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger data-testid="select-to-token">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {['BTC', 'ETH', 'BNB', 'USDT', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRUMP'].map(token => (
                        <SelectItem key={token} value={token}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{TOKEN_ICONS[token] || '💎'}</span>
                            <span>{token}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Balance: {tokenBalances?.find(b => b.tokenSymbol === toToken)?.balance || '0'}
                  </p>
                </div>

                {/* Swap Button */}
                <Button
                  onClick={() => swapMutation.mutate()}
                  disabled={!fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken || swapMutation.isPending}
                  className="w-full bg-gradient-to-r from-flux-cyan to-flux-purple hover:opacity-90 text-white font-semibold rounded-xl py-6 shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-swap"
                >
                  {swapMutation.isPending ? 'Swapping...' : 'Swap Tokens'}
                </Button>

                {/* Info */}
                <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">
                    • Swaps are instant and off-chain
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • Exchange rates are based on current market prices
                  </p>
                  <p className="text-xs text-muted-foreground">
                    • No gas fees - swaps happen in your account balance
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
