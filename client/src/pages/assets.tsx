import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/app-layout";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TokenBalance, TokenAddress } from '@shared/schema';
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Copy, Eye, EyeOff, ArrowDownUp, Wallet, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { motion } from "framer-motion";

import FluxLogoHeader from "@/components/flux-logo-header";

const TOKEN_LOGO_URLS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  ARB: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
  OP: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
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
      <div className={`${sizeClasses[size]} rounded-full bg-[#00FF80]/10 flex items-center justify-center`}>
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
  const { user, isLoading } = useAuth();
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

  // Dummy data for token deposits, as described in thinking
  const { data: depositHistory, isLoading: depositLoading } = useQuery<Array<{ id: string; amount: string; token: string; date: string; status: string }>>({
    queryKey: ['/api/deposit-history'],
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
        title: "✓ Swap Successful!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/token-balances/${user?.id}`] });
      setFromAmount('');
      setShowSwap(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "⚠️ Swap Failed",
        description: error.message || "Failed to execute swap",
      });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-md w-full">
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#00FF80]/30 text-center"
              style={{ boxShadow: "0 0 40px rgba(0, 255, 128, 0.2)" }}>
              <FluxLogoHeader />
              <div className="mb-6 mt-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00FF80] to-[#00CC66] flex items-center justify-center mx-auto mb-4"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 128, 0.5)" }}>
                  <Lock className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-3">
                  Access Restricted
                </h1>
                <p className="text-lg text-gray-300 mb-2">Please log in to view your assets</p>
              </div>
              <div className="space-y-3">
                <Button onClick={() => setLocation('/login')}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00FF80] to-[#00CC66] hover:opacity-90 text-black font-bold"
                  style={{ boxShadow: '0 0 20px rgba(0, 255, 128, 0.4)' }}>
                  Sign In <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button onClick={() => setLocation('/register')} variant="outline"
                  className="w-full h-12 rounded-xl border-[#00FF80]/30 text-[#00FF80] hover:bg-[#00FF80]/10">
                  Create Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✓ Copied!",
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
      <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
        {/* Animated background similar to login */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{ opacity: 0.6 }}>
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 60%) 0%, hsl(150 100% 40%) 50%, transparent 70%)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 50%) 0%, hsl(150 100% 35%) 50%, transparent 70%)',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse-slow"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 55%) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 pb-24">
          <div className="max-w-xl mx-auto px-6 pt-6">
            {/* FluxTrade Logo Header */}
            <FluxLogoHeader />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-2">
                Assets
              </h1>
              <p className="text-sm text-gray-400">Manage your cryptocurrency holdings</p>
            </div>

            {/* Portfolio Overview Card */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#00FF80]/30"
              style={{
                boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
              }}
            >
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent">
                  ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Across {tokenBalances?.filter(b => parseFloat(b.balance) > 0).length || 0} tokens
                </p>
              </div>
              <Button
                onClick={() => setShowSwap(!showSwap)}
                variant={showSwap ? "default" : "outline"}
                className={showSwap
                  ? "w-full bg-gradient-to-r from-[#00FF99] to-[#00CC66] hover:from-[#00FF99]/90 hover:to-[#00CC66]/90 text-black font-semibold"
                  : "w-full border-[#00FF80]/30 text-white hover:bg-[#00FF80]/10"
                }
                style={showSwap ? {
                  boxShadow: "0 0 20px rgba(0, 255, 128, 0.5)",
                } : {}}
              >
                <ArrowDownUp className="w-4 h-4 mr-2" />
                {showSwap ? 'Hide Swap' : 'Swap Tokens'}
              </Button>
            </div>

            {/* Swap Section */}
            {showSwap && (
              <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#00FF80]/30"
                style={{
                  boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
                }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowDownUp className="w-5 h-5 text-[#00FF80]" />
                  Swap Tokens
                </h3>
                <div className="space-y-4">
                  {/* From Token */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">From</label>
                    <div className="flex gap-2">
                      <Select value={fromToken} onValueChange={setFromToken}>
                        <SelectTrigger className="w-32 bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white" data-testid="select-from-token">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <TokenIcon symbol={fromToken} size="sm" />
                              <span>{fromToken}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#00FF80]/30">
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
                        className="flex-1 bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Balance: {tokenBalances?.find(b => b.tokenSymbol === fromToken)?.balance || '0'}
                    </p>
                  </div>

                  {/* Swap Icon */}
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#00FF80]/20 flex items-center justify-center"
                      style={{ boxShadow: "0 0 15px rgba(0, 255, 128, 0.3)" }}
                    >
                      <ArrowDownUp className="w-5 h-5 text-[#00FF80]" />
                    </div>
                  </div>

                  {/* To Token */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">To</label>
                    <div className="flex gap-2">
                      <Select value={toToken} onValueChange={setToToken}>
                        <SelectTrigger className="w-32 bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white" data-testid="select-to-token">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <TokenIcon symbol={toToken} size="sm" />
                              <span>{toToken}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#00FF80]/30">
                          {['BTC', 'ETH', 'BNB', 'USDT', 'MATIC', 'AVAX', 'ARB', 'OP', 'TRUMP'].map(token => (
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
                        className="flex-1 bg-[#0A0A0A]/50 border-[#00FF80]/30 bg-[#00FF80]/5 text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Balance: {tokenBalances?.find(b => b.tokenSymbol === toToken)?.balance || '0'}
                    </p>
                  </div>

                  {/* Exchange Rate Info */}
                  {fromAmount && parseFloat(fromAmount) > 0 && tokenPrices && (
                    <div className="bg-[#00FF80]/5 rounded-xl p-4 space-y-2 border border-[#00FF80]/20">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-white font-medium">
                          1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold pt-2 border-t border-[#00FF80]/20">
                        <span className="text-white">You'll receive</span>
                        <span className="text-[#00FF80]">{estimatedReceive.toFixed(8)} {toToken}</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Button */}
                  <Button
                    onClick={() => swapMutation.mutate()}
                    disabled={!fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken || swapMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#00FF99] to-[#00CC66] hover:from-[#00FF99]/90 hover:to-[#00CC66]/90 text-black font-semibold"
                    data-testid="button-swap"
                    style={{
                      boxShadow: "0 0 20px rgba(0, 255, 128, 0.5)",
                    }}
                  >
                    {swapMutation.isPending ? 'Swapping...' : 'Swap Tokens'}
                  </Button>
                </div>
              </div>
            )}

            {/* Token Balances */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Token Balances</h2>

              {balancesLoading ? (
                <div className="text-center py-12 text-gray-400">Loading balances...</div>
              ) : !tokenBalances || tokenBalances.length === 0 ? (
                <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-12 text-center border-2 border-[#00FF80]/30"
                  style={{
                    boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
                  }}
                >
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-[#00FF80]/50" />
                  <p className="text-gray-400">No token balances found</p>
                  <p className="text-sm text-gray-500 mt-2">Create a wallet to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokenBalances
                    .filter(balance => tokenAddresses?.some(a => a.token === balance.tokenSymbol))
                    .map((balance) => {
                    const address = tokenAddresses?.find(a => a.token === balance.tokenSymbol);
                    const isVisible = showAddresses[balance.tokenSymbol];
                    const tokenPrice = tokenPrices?.[balance.tokenSymbol]?.price || 0;
                    const tokenValue = parseFloat(balance.balance) * tokenPrice;

                    return (
                      <div key={balance.id} className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-4 border-2 border-[#00FF80]/30 transition-all hover:border-[#00FF80]/50"
                        style={{
                          boxShadow: "0 0 20px rgba(0, 255, 128, 0.15), inset 0 0 15px rgba(0, 255, 128, 0.03)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <TokenIcon symbol={balance.tokenSymbol} size="md" />
                            <div>
                              <h4 className="font-semibold text-white">{balance.tokenSymbol}</h4>
                              <p className="text-xs text-gray-400">
                                ${tokenValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white" data-testid={`balance-${balance.tokenSymbol}`}>
                              {parseFloat(balance.balance).toLocaleString(undefined, {
                                minimumFractionDigits: balance.tokenSymbol === 'USDT' ? 2 : 6,
                                maximumFractionDigits: balance.tokenSymbol === 'USDT' ? 2 : 6
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Address */}
                        {address && (
                          <div className="bg-[#00FF80]/5 rounded-lg p-3 border border-[#00FF80]/20">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-400">Address</p>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-[#00FF80]/20"
                                  onClick={() => toggleAddressVisibility(balance.tokenSymbol)}
                                  data-testid={`toggle-address-${balance.tokenSymbol}`}
                                >
                                  {isVisible ? <EyeOff className="w-3 h-3 text-gray-400" /> : <Eye className="w-3 h-3 text-gray-400" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-[#00FF80]/20"
                                  onClick={() => copyToClipboard(address.address, `${balance.tokenSymbol} address`)}
                                  data-testid={`copy-address-${balance.tokenSymbol}`}
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs font-mono text-white">
                              {isVisible ? address.address : truncateAddress(address.address)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

             {/* Deposit History Section (Enhanced look as requested) */}
             <div className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold text-white">Deposit History</h2>
              {depositLoading ? (
                <div className="text-center py-12 text-gray-400">Loading deposit history...</div>
              ) : !depositHistory || depositHistory.length === 0 ? (
                <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-12 text-center border-2 border-[#00FF80]/30"
                  style={{
                    boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
                  }}
                >
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-[#00FF80]/50" />
                  <p className="text-gray-400">No recent deposits found</p>
                </div>
              ) : (
                <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#00FF80]/30"
                  style={{
                    boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
                  }}
                >
                  <table className="w-full text-left text-sm">
                    <thead className="text-gray-400 uppercase border-b border-[#00FF80]/20">
                      <tr>
                        <th scope="col" className="py-3 px-2">Date</th>
                        <th scope="col" className="py-3 px-2">Token</th>
                        <th scope="col" className="py-3 px-2">Amount</th>
                        <th scope="col" className="py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositHistory.map((deposit) => (
                        <tr key={deposit.id} className="border-b border-[#00FF80]/10 last:border-none hover:bg-[#0A0A0A]/40 transition-all">
                          <td className="py-4 px-2 font-medium text-white whitespace-nowrap">{new Date(deposit.date).toLocaleDateString()}</td>
                          <td className="py-4 px-2 flex items-center gap-2">
                            <TokenIcon symbol={deposit.token} size="sm" />
                            <span>{deposit.token}</span>
                          </td>
                          <td className="py-4 px-2 text-white">
                            {parseFloat(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                          </td>
                          <td className="py-4 px-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              deposit.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                              deposit.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {deposit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}