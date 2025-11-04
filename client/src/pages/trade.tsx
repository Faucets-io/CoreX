import { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, Activity, TrendingUp, ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';
import { formatBitcoin } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TokenBalance } from '@shared/schema';
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";
import FluxLogoHeader from "@/components/flux-logo-header";

interface TradeOrder {
  id: number;
  type: 'buy' | 'sell';
  amount: string;
  price: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  token?: string;
}

interface Token {
  symbol: string;
  name: string;
  tradingViewSymbol: string;
  coinGeckoId: string;
}

const SUPPORTED_TOKENS: Token[] = [
  { symbol: 'BTC', name: 'Bitcoin', tradingViewSymbol: 'BINANCE:BTCUSDT', coinGeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', tradingViewSymbol: 'BINANCE:ETHUSDT', coinGeckoId: 'ethereum' },
  { symbol: 'BNB', name: 'BNB', tradingViewSymbol: 'BINANCE:BNBUSDT', coinGeckoId: 'binancecoin' },
  { symbol: 'MATIC', name: 'Polygon', tradingViewSymbol: 'BINANCE:MATICUSDT', coinGeckoId: 'matic-network' },
  { symbol: 'AVAX', name: 'Avalanche', tradingViewSymbol: 'BINANCE:AVAXUSDT', coinGeckoId: 'avalanche-2' },
  { symbol: 'ARB', name: 'Arbitrum', tradingViewSymbol: 'BINANCE:ARBUSDT', coinGeckoId: 'arbitrum' },
  { symbol: 'OP', name: 'Optimism', tradingViewSymbol: 'BINANCE:OPUSDT', coinGeckoId: 'optimism' },
  { symbol: 'TRUMP', name: 'TRUMP', tradingViewSymbol: 'BINANCE:TRUMPUSDT', coinGeckoId: 'official-trump' },
];

function TokenBalanceDisplay({ userId, selectedToken, currentPrice }: { userId: number; selectedToken: string; currentPrice: number }) {
  const { data: tokenBalances } = useQuery<TokenBalance[]>({
    queryKey: [`/api/token-balances/${userId}`],
    refetchInterval: 3000,
  });

  const tokenBalance = tokenBalances?.find(b => b.tokenSymbol === selectedToken);
  const usdtBalance = tokenBalances?.find(b => b.tokenSymbol === 'USDT');

  const balance = parseFloat(tokenBalance?.balance || '0');
  const usdtBal = parseFloat(usdtBalance?.balance || '0');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-lg p-3 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
        <p className="text-xs mb-1" style={{ color: '#BFBFBF' }}>{selectedToken} Balance</p>
        <p className="text-lg font-bold" style={{ color: '#FFFFFF' }} data-testid="text-balance">
          {formatBitcoin(balance.toString())} {selectedToken}
        </p>
      </div>

      <div className="rounded-lg p-3 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
        <p className="text-xs mb-1" style={{ color: '#BFBFBF' }}>USD Value</p>
        <p className="text-lg font-bold" style={{ color: '#00FF99' }} data-testid="text-usd-value">
          ${(balance * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="rounded-lg p-3 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
        <p className="text-xs mb-1" style={{ color: '#BFBFBF' }}>USDT Balance</p>
        <p className="text-lg font-bold" style={{ color: '#FFFFFF' }} data-testid="text-usdt-balance">
          ${usdtBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

export default function Trade() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [localTradeHistory, setLocalTradeHistory] = useState<TradeOrder[]>([]);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

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

  // Fetch token price from CoinGecko
  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${selectedToken.coinGeckoId}&vs_currencies=usd&include_24hr_change=true`
        );
        const data = await response.json();
        const tokenData = data[selectedToken.coinGeckoId];
        if (tokenData) {
          setTokenPrice(tokenData.usd);
          setPriceChange24h(tokenData.usd_24h_change || 0);
        }
      } catch (error) {
        console.error('Failed to fetch token price:', error);
      }
    };

    fetchTokenPrice();
    const interval = setInterval(fetchTokenPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedToken]);

  const currentPrice = tokenPrice;

  // Load TradingView widget
  useEffect(() => {
    const container = document.getElementById('tradingview_chart');
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: selectedToken.tradingViewSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart",
          backgroundColor: "#0a0a0a",
          gridColor: "#1a1a1a",
          height: 600,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [selectedToken]);

  if (!user) {
    setLocation('/login');
    return null;
  }

  const { data: allTrades, refetch: refetchTrades } = useQuery<TradeOrder[]>({
    queryKey: ['/api/trades/all', selectedToken.symbol],
    queryFn: () => fetch(`/api/trades/all?token=${selectedToken.symbol}`).then(res => res.json()),
    refetchInterval: 3000,
  });

  // Fetch user trade history
  const { data: userTradeHistory, refetch: refetchUserHistory } = useQuery<TradeOrder[]>({
    queryKey: ['/api/trades/history', user.id, selectedToken.symbol],
    queryFn: () => fetch(`/api/trades/history/${user.id}?token=${selectedToken.symbol}`).then(res => res.json()),
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const executeTradeMutation = useMutation({
    mutationFn: async (data: { type: 'buy' | 'sell'; amount: string }) => {
      const response = await fetch('/api/trades/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          type: data.type,
          amount: data.amount,
          price: currentPrice,
          token: selectedToken.symbol
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Trade execution failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setLocalTradeHistory(prev => [{...data, token: selectedToken.symbol}, ...prev].slice(0, 50));
      queryClient.invalidateQueries({ queryKey: [`/api/token-balances/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/history', user.id, selectedToken.symbol] });

      toast({
        title: "Trade Executed",
        description: `Successfully ${data.type === 'buy' ? 'bought' : 'sold'} ${data.amount} ${selectedToken.symbol}`,
      });

      setBuyAmount('');
      setSellAmount('');
    },
    onError: (error: Error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuy = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      });
      return;
    }
    executeTradeMutation.mutate({ type: 'buy', amount: buyAmount });
  };

  const handleSell = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to sell",
        variant: "destructive",
      });
      return;
    }
    executeTradeMutation.mutate({ type: 'sell', amount: sellAmount });
  };

  const handleRefresh = () => {
    refetchTrades();
    refetchUserHistory();
    queryClient.invalidateQueries({ queryKey: [`/api/token-balances/${user.id}`] });
    toast({
      title: "Refreshed",
      description: "Market data has been refreshed",
    });
  };

  const buyTotal = buyAmount ? (parseFloat(buyAmount) * currentPrice).toFixed(2) : '0.00';
  const sellTotal = sellAmount ? (parseFloat(sellAmount) * currentPrice).toFixed(2) : '0.00';

  // Calculate advanced stats with minimum volume guarantee
  const calculatedVolume = allTrades?.reduce((sum, trade) => {
    const amount = parseFloat(trade.amount);
    return sum + (amount * currentPrice);
  }, 0) || 0;

  // Ensure 24h volume is always in millions (minimum 2 million)
  const totalVolume = Math.max(calculatedVolume * 720, 2000000); // Multiply by 720 to simulate 24h (200 trades * 720 = full day estimate)
  const buyOrders = allTrades?.filter(t => t.type === 'buy').length || 0;
  const sellOrders = allTrades?.filter(t => t.type === 'sell').length || 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-white/10"
              style={{ color: '#00FF99' }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <FluxLogoHeader />
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="rounded-full px-4 py-2 border hover:scale-105 transition-transform"
            style={{ 
              borderColor: '#00FF99',
              color: '#00FF99',
              backgroundColor: 'transparent',
              boxShadow: '0 0 15px rgba(0, 255, 153, 0.2)'
            }}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Hero Section with Globe Animation */}
      <section className="relative h-[300px] overflow-hidden">
        <div ref={vantaRef} className="absolute inset-0" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="text-4xl md:text-5xl font-bold mb-4" style={{ 
            background: 'linear-gradient(90deg, #00FF99, #00CC66)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Trade Crypto
          </div>
          <p className="text-lg mb-6" style={{ color: '#BFBFBF' }}>
            Buy and Sell Digital Assets in Real-Time
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              variant="outline" 
              className="rounded-full border-2 hover:scale-105 transition-all duration-300"
              style={{ 
                borderColor: '#00FF99',
                color: '#00FF99',
                backgroundColor: 'transparent',
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.2)'
              }}
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              data-testid="button-stats"
            >
              <BarChart3 className="mr-2 w-4 h-4" />
              {showAdvancedStats ? 'Hide Stats' : 'Market Stats'}
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Token Selection & Price Display */}
        <div className="mb-6">
          <Card 
            className="rounded-2xl border overflow-hidden"
            style={{ 
              backgroundColor: '#1A1A1A',
              borderColor: '#2A2A2A',
              boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)'
            }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-full sm:w-64">
                    <Label className="text-sm mb-2 block" style={{ color: '#BFBFBF' }}>Select Token</Label>
                    <Select value={selectedToken.symbol} onValueChange={(value) => {
                      const token = SUPPORTED_TOKENS.find(t => t.symbol === value);
                      if (token) setSelectedToken(token);
                    }}>
                      <SelectTrigger 
                        className="h-12 rounded-lg border"
                        style={{ 
                          backgroundColor: '#0A0A0A',
                          borderColor: '#2A2A2A',
                          color: '#FFFFFF'
                        }}
                        data-testid="select-token"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
                        {SUPPORTED_TOKENS.map((token) => (
                          <SelectItem 
                            key={token.symbol} 
                            value={token.symbol}
                            style={{ color: '#FFFFFF' }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{token.symbol}</span>
                              <span style={{ color: '#BFBFBF' }} className="text-sm">- {token.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm mb-1" style={{ color: '#BFBFBF' }}>Current Price</p>
                        <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }} data-testid="text-price">
                          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </p>
                      </div>
                      <Badge 
                        className="rounded-full px-3 py-1"
                        style={priceChange24h >= 0 ? {
                          backgroundColor: 'rgba(0, 255, 153, 0.2)',
                          color: '#00FF99',
                          border: '1px solid rgba(0, 255, 153, 0.3)'
                        } : {
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                        data-testid="badge-price-change"
                      >
                        {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
                      </Badge>
                    </div>
                  </div>
                </div>

                <TokenBalanceDisplay 
                  userId={user.id} 
                  selectedToken={selectedToken.symbol} 
                  currentPrice={currentPrice}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Market Stats */}
        {showAdvancedStats && (
          <div className="mb-6">
            <Card 
              className="rounded-2xl border overflow-hidden"
              style={{ 
                backgroundColor: '#1A1A1A',
                borderColor: '#00FF99',
                boxShadow: '0 0 20px rgba(0, 255, 153, 0.2)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#00FF99' }}>
                  Market Statistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0A0A0A' }}>
                    <p className="text-sm mb-1" style={{ color: '#BFBFBF' }}>24h Volume</p>
                    <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                      ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0A0A0A' }}>
                    <p className="text-sm mb-1" style={{ color: '#BFBFBF' }}>Buy Orders</p>
                    <p className="text-xl font-bold" style={{ color: '#00FF99' }}>{buyOrders}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0A0A0A' }}>
                    <p className="text-sm mb-1" style={{ color: '#BFBFBF' }}>Sell Orders</p>
                    <p className="text-xl font-bold" style={{ color: '#EF4444' }}>{sellOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-8">
            <Card 
              className="rounded-2xl border overflow-hidden"
              style={{ 
                backgroundColor: '#1A1A1A',
                borderColor: '#2A2A2A',
                boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)'
              }}
            >
              <div id="tradingview_chart" style={{ height: '600px' }}></div>
            </Card>
          </div>

          {/* Right Sidebar - Order Book and Trading Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Book */}
            <Card 
              className="rounded-2xl border"
              style={{ 
                backgroundColor: '#1A1A1A',
                borderColor: '#2A2A2A',
                boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)'
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                    <Activity className="w-5 h-5 animate-pulse" style={{ color: '#00FF99' }} />
                    Order Book
                  </CardTitle>
                  <Badge 
                    className="rounded-full px-3 py-1"
                    style={{ 
                      backgroundColor: 'rgba(0, 255, 153, 0.2)',
                      color: '#00FF99',
                      border: '1px solid rgba(0, 255, 153, 0.3)'
                    }}
                    data-testid="badge-live-orders"
                  >
                    {allTrades?.length || 0}+ Orders
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-3 gap-2 pb-2 text-xs font-medium" style={{ color: '#BFBFBF' }}>
                    <div className="text-left">Price (USD)</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Total</div>
                  </div>
                </div>

                <ScrollArea className="h-64">
                  <div className="px-4 space-y-0.5">
                    {allTrades && allTrades.length > 0 ? (
                      allTrades.slice(0, 20).map((trade, index) => {
                        const amount = parseFloat(trade.amount);
                        const total = amount * currentPrice;
                        const depth = Math.min((amount / 10) * 100, 100);

                        return (
                          <div
                            key={trade.id}
                            className={`relative grid grid-cols-3 gap-2 py-1.5 px-2 text-xs rounded transition-all ${
                              index === 0 ? 'animate-pulse' : ''
                            }`}
                            style={{ 
                              backgroundColor: trade.type === 'sell' 
                                ? 'rgba(239, 68, 68, 0.05)' 
                                : 'rgba(0, 255, 153, 0.05)' 
                            }}
                          >
                            <div 
                              className="absolute right-0 top-0 bottom-0 rounded"
                              style={{ 
                                width: `${depth}%`,
                                backgroundColor: trade.type === 'sell' 
                                  ? 'rgba(239, 68, 68, 0.1)' 
                                  : 'rgba(0, 255, 153, 0.1)'
                              }}
                            />

                            <div 
                              className="font-mono font-semibold relative z-10"
                              style={{ color: trade.type === 'sell' ? '#EF4444' : '#00FF99' }}
                            >
                              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="font-mono relative z-10 text-right" style={{ color: '#FFFFFF' }}>
                              {amount.toFixed(6)}
                            </div>
                            <div className="font-mono relative z-10 text-right" style={{ color: '#BFBFBF' }}>
                              ${total.toFixed(2)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-sm" style={{ color: '#BFBFBF' }}>
                        No orders
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card 
              className="rounded-2xl border"
              style={{ 
                backgroundColor: '#1A1A1A',
                borderColor: '#2A2A2A',
                boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)'
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ color: '#FFFFFF' }}>Trade {selectedToken.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
                  <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-lg" style={{ backgroundColor: '#0A0A0A' }}>
                    <Button
                      onClick={() => setActiveTab('buy')}
                      className="rounded-lg transition-all"
                      style={activeTab === 'buy' ? {
                        background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                        color: '#0A0A0A',
                        boxShadow: '0 0 15px rgba(0, 255, 153, 0.3)'
                      } : {
                        backgroundColor: 'transparent',
                        color: '#BFBFBF'
                      }}
                      data-testid="tab-buy"
                    >
                      Buy
                    </Button>
                    <Button
                      onClick={() => setActiveTab('sell')}
                      className="rounded-lg transition-all"
                      style={activeTab === 'sell' ? {
                        background: 'linear-gradient(90deg, #EF4444, #DC2626)',
                        color: '#FFFFFF',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
                      } : {
                        backgroundColor: 'transparent',
                        color: '#BFBFBF'
                      }}
                      data-testid="tab-sell"
                    >
                      Sell
                    </Button>
                  </div>

                  <TabsContent value="buy" className="space-y-4 mt-0">
                    <div>
                      <Label htmlFor="buy-amount" className="text-sm mb-2 block" style={{ color: '#BFBFBF' }}>
                        Amount ({selectedToken.symbol})
                      </Label>
                      <Input
                        id="buy-amount"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        className="font-mono rounded-lg border"
                        style={{ 
                          backgroundColor: '#0A0A0A',
                          borderColor: '#2A2A2A',
                          color: '#FFFFFF'
                        }}
                        data-testid="input-buy-amount"
                      />
                    </div>

                    <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: '#0A0A0A' }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#BFBFBF' }}>Price</span>
                        <span style={{ color: '#FFFFFF' }} className="font-medium">
                          ${currentPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#BFBFBF' }}>Total</span>
                        <span style={{ color: '#00FF99' }} className="font-bold">${buyTotal}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBuy}
                      disabled={executeTradeMutation.isPending || !buyAmount}
                      className="w-full rounded-lg py-6 text-lg font-semibold hover:scale-[1.02] transition-transform"
                      style={{ 
                        background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                        color: '#0A0A0A',
                        boxShadow: '0 0 20px rgba(0, 255, 153, 0.3)'
                      }}
                      data-testid="button-buy"
                    >
                      {executeTradeMutation.isPending ? 'Processing...' : `Buy ${selectedToken.symbol}`}
                    </Button>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-4 mt-0">
                    <div>
                      <Label htmlFor="sell-amount" className="text-sm mb-2 block" style={{ color: '#BFBFBF' }}>
                        Amount ({selectedToken.symbol})
                      </Label>
                      <Input
                        id="sell-amount"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        className="font-mono rounded-lg border"
                        style={{ 
                          backgroundColor: '#0A0A0A',
                          borderColor: '#2A2A2A',
                          color: '#FFFFFF'
                        }}
                        data-testid="input-sell-amount"
                      />
                    </div>

                    <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: '#0A0A0A' }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#BFBFBF' }}>Price</span>
                        <span style={{ color: '#FFFFFF' }} className="font-medium">
                          ${currentPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#BFBFBF' }}>Total</span>
                        <span style={{ color: '#EF4444' }} className="font-bold">${sellTotal}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSell}
                      disabled={executeTradeMutation.isPending || !sellAmount}
                      className="w-full rounded-lg py-6 text-lg font-semibold hover:scale-[1.02] transition-transform"
                      style={{ 
                        background: 'linear-gradient(90deg, #EF4444, #DC2626)',
                        color: '#FFFFFF',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                      }}
                      data-testid="button-sell"
                    >
                      {executeTradeMutation.isPending ? 'Processing...' : `Sell ${selectedToken.symbol}`}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Trade History - Full Width Below */}
          <div className="lg:col-span-12">
            <Card 
              className="rounded-2xl border"
              style={{ 
                backgroundColor: '#1A1A1A',
                borderColor: '#2A2A2A',
                boxShadow: '0 0 20px rgba(0, 255, 128, 0.1)'
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg" style={{ color: '#FFFFFF' }}>Recent Trades</CardTitle>
                    <p className="text-sm mt-1" style={{ color: '#BFBFBF' }}>Your latest trading activity</p>
                  </div>
                  <Badge 
                    className="rounded-full px-3 py-1"
                    style={{ 
                      backgroundColor: 'rgba(0, 255, 153, 0.2)',
                      color: '#00FF99',
                      border: '1px solid rgba(0, 255, 153, 0.3)'
                    }}
                  >
                    {userTradeHistory?.length || 0} Trades
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {userTradeHistory && userTradeHistory.length > 0 ? (
                  <div className="space-y-3">
                    {userTradeHistory.slice(0, 10).map((trade) => (
                      <div 
                        key={trade.id} 
                        className="flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.01]" 
                        style={{ 
                          backgroundColor: '#0A0A0A',
                          border: '1px solid #2A2A2A'
                        }}
                        data-testid={`trade-item-${trade.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: trade.type === 'buy' 
                                ? 'rgba(0, 255, 153, 0.2)' 
                                : 'rgba(239, 68, 68, 0.2)'
                            }}
                          >
                            {trade.type === 'buy' ? (
                              <ArrowDownLeft className="w-5 h-5" style={{ color: '#00FF99' }} />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" style={{ color: '#EF4444' }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#FFFFFF' }}>
                              {trade.type === 'buy' ? 'Buy' : 'Sell'} {trade.token || selectedToken.symbol}
                            </p>
                            <p className="text-xs" style={{ color: '#BFBFBF' }}>
                              {new Date(trade.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium" style={{ color: '#FFFFFF' }}>
                            {trade.amount} {trade.token || selectedToken.symbol}
                          </p>
                          <p className="text-xs" style={{ color: '#BFBFBF' }}>${trade.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: '#2A2A2A' }} />
                    <p className="text-sm" style={{ color: '#BFBFBF' }}>No trades yet</p>
                    <p className="text-xs mt-1" style={{ color: '#2A2A2A' }}>
                      Start trading to see your order history here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}