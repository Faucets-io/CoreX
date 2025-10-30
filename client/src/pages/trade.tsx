import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/app-layout";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, Activity, TrendingUp, Info } from 'lucide-react';
import { formatBitcoin } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TokenBalance } from '@shared/schema';

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
  { symbol: 'XRP', name: 'Ripple', tradingViewSymbol: 'BINANCE:XRPUSDT', coinGeckoId: 'ripple' },
  { symbol: 'TRUMP', name: 'TRUMP', tradingViewSymbol: 'BINANCE:TRUMPUSDT', coinGeckoId: 'official-trump' },
  { symbol: 'SOL', name: 'Solana', tradingViewSymbol: 'BINANCE:SOLUSDT', coinGeckoId: 'solana' },
  { symbol: 'ADA', name: 'Cardano', tradingViewSymbol: 'BINANCE:ADAUSDT', coinGeckoId: 'cardano' },
  { symbol: 'DOGE', name: 'Dogecoin', tradingViewSymbol: 'BINANCE:DOGEUSDT', coinGeckoId: 'dogecoin' },
];

function TokenBalanceDisplay({ userId, selectedToken, currentPrice }: { userId: number; selectedToken: string; currentPrice: number }) {
  const { data: tokenBalances } = useQuery<TokenBalance[]>({
    queryKey: ['/api/token-balances', userId],
    refetchInterval: 3000,
  });

  const { data: usdtBalance } = useQuery<TokenBalance | undefined>({
    queryKey: ['/api/token-balance/USDT', userId],
    queryFn: () => {
      const balance = tokenBalances?.find(b => b.tokenSymbol === 'USDT');
      return balance;
    },
    enabled: !!tokenBalances,
  });

  const tokenBalance = tokenBalances?.find(b => b.tokenSymbol === selectedToken);
  const balance = parseFloat(tokenBalance?.balance || '0');
  const usdtBal = parseFloat(usdtBalance?.balance || '0');

  return (
    <div className="flex items-center gap-4">
      <Card className="flex-1 lg:flex-none bg-card/50 border-border">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">{selectedToken} Balance</p>
          <p className="text-lg font-bold text-foreground" data-testid="text-balance">
            {formatBitcoin(balance.toString())} {selectedToken}
          </p>
        </CardContent>
      </Card>
      
      <Card className="flex-1 lg:flex-none bg-card/50 border-border">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">USD Value</p>
          <p className="text-lg font-bold text-foreground" data-testid="text-usd-value">
            ${(balance * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card className="flex-1 lg:flex-none bg-card/50 border-border">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">USDT Balance</p>
          <p className="text-lg font-bold text-foreground" data-testid="text-usdt-balance">
            ${usdtBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Trade() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [localTradeHistory, setLocalTradeHistory] = useState<TradeOrder[]>([]);

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
          toolbar_bg: "#0a0e1a",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart",
          backgroundColor: "#0a0e1a",
          gridColor: "#1a1e2e",
          height: 600,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [selectedToken]);

  if (!user) {
    setLocation('/login');
    return null;
  }

  const { data: allTrades } = useQuery<TradeOrder[]>({
    queryKey: ['/api/trades/all', selectedToken.symbol],
    queryFn: () => fetch(`/api/trades/all?token=${selectedToken.symbol}`).then(res => res.json()),
    refetchInterval: 3000,
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

  const buyTotal = buyAmount ? (parseFloat(buyAmount) * currentPrice).toFixed(2) : '0.00';
  const sellTotal = sellAmount ? (parseFloat(sellAmount) * currentPrice).toFixed(2) : '0.00';

  return (
    <AppLayout>
      {/* Trading Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-full lg:w-64">
                <Select value={selectedToken.symbol} onValueChange={(value) => {
                  const token = SUPPORTED_TOKENS.find(t => t.symbol === value);
                  if (token) setSelectedToken(token);
                }}>
                  <SelectTrigger className="h-12 bg-card" data-testid="select-token">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_TOKENS.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{token.symbol}</span>
                          <span className="text-muted-foreground text-sm">- {token.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="hidden lg:block">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-price">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </p>
                  </div>
                  <Badge 
                    variant={priceChange24h >= 0 ? "default" : "destructive"} 
                    className="text-sm px-3 py-1"
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
        </div>
      </div>

      {/* Main Trading Interface - Desktop Grid Layout */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Chart Area - Takes up most space on desktop */}
          <div className="lg:col-span-8">
            <Card className="bg-card border-border overflow-hidden">
              <div id="tradingview_chart" style={{ height: '600px' }}></div>
            </Card>
          </div>

          {/* Right Sidebar - Order Book and Trading Panel */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            {/* Order Book */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary animate-pulse" />
                    Order Book
                  </CardTitle>
                  <Badge variant="outline" className="text-xs" data-testid="badge-live-orders">
                    {allTrades?.length || 0} Orders
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-3 gap-2 pb-2 text-xs text-muted-foreground font-medium">
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
                              trade.type === 'sell' ? 'hover:bg-destructive/5' : 'hover:bg-emerald/5'
                            } ${index === 0 ? 'animate-pulse' : ''}`}
                          >
                            <div 
                              className={`absolute right-0 top-0 bottom-0 rounded ${
                                trade.type === 'sell' ? 'bg-destructive/10' : 'bg-emerald/10'
                              }`}
                              style={{ width: `${depth}%` }}
                            />
                            
                            <div className={`font-mono font-semibold relative z-10 ${
                              trade.type === 'sell' ? 'text-destructive' : 'text-emerald'
                            }`}>
                              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-foreground text-right font-mono relative z-10">
                              {amount.toFixed(6)}
                            </div>
                            <div className="text-muted-foreground text-right font-mono relative z-10">
                              ${total.toFixed(2)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No orders
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade {selectedToken.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger 
                      value="buy" 
                      className="data-[state=active]:bg-emerald data-[state=active]:text-white"
                      data-testid="tab-buy"
                    >
                      Buy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sell"
                      className="data-[state=active]:bg-destructive data-[state=active]:text-white"
                      data-testid="tab-sell"
                    >
                      Sell
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="buy" className="space-y-4">
                    <div>
                      <Label htmlFor="buy-amount" className="text-sm">Amount ({selectedToken.symbol})</Label>
                      <Input
                        id="buy-amount"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        className="mt-1.5 font-mono"
                        data-testid="input-buy-amount"
                      />
                    </div>

                    <div className="bg-accent/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="text-foreground font-medium">${currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-foreground font-bold">${buyTotal}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBuy}
                      disabled={executeTradeMutation.isPending || !buyAmount}
                      className="w-full bg-emerald hover:bg-emerald/90 text-white h-11"
                      data-testid="button-buy"
                    >
                      {executeTradeMutation.isPending ? 'Processing...' : `Buy ${selectedToken.symbol}`}
                    </Button>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-4">
                    <div>
                      <Label htmlFor="sell-amount" className="text-sm">Amount ({selectedToken.symbol})</Label>
                      <Input
                        id="sell-amount"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        className="mt-1.5 font-mono"
                        data-testid="input-sell-amount"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Available: {formatBitcoin(user.balance)} {selectedToken.symbol}
                      </p>
                    </div>

                    <div className="bg-accent/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="text-foreground font-medium">${currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-foreground font-bold">${sellTotal}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSell}
                      disabled={executeTradeMutation.isPending || !sellAmount}
                      className="w-full bg-destructive hover:bg-destructive/90 text-white h-11"
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Recent Trades</CardTitle>
                <p className="text-sm text-muted-foreground">Your latest trading activity</p>
              </CardHeader>
              <CardContent>
                {localTradeHistory && localTradeHistory.length > 0 ? (
                  <div className="space-y-2">
                    {localTradeHistory.slice(0, 10).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors" data-testid={`trade-item-${trade.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            trade.type === 'buy' ? 'bg-emerald/20' : 'bg-destructive/20'
                          }`}>
                            {trade.type === 'buy' ? (
                              <ArrowDownLeft className="w-5 h-5 text-emerald" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {trade.type === 'buy' ? 'Buy' : 'Sell'} {trade.token || selectedToken.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(trade.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{trade.amount} {trade.token || selectedToken.symbol}</p>
                          <p className="text-xs text-muted-foreground">${trade.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No trades yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Start trading to see your order history here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
