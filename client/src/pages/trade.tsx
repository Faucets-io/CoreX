
import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, Activity, TrendingUp } from 'lucide-react';
import { formatBitcoin } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/use-currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TradeOrder {
  id: number;
  type: 'buy' | 'sell';
  amount: string;
  price: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
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

export default function Trade() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);

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
    const interval = setInterval(fetchTokenPrice, 30000); // Update every 30 seconds
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
          height: 400,
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

  const { data: tradeHistory } = useQuery<TradeOrder[]>({
    queryKey: ['/api/trades/history', user?.id],
    queryFn: () => fetch(`/api/trades/history/${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  const { data: allTrades } = useQuery<TradeOrder[]>({
    queryKey: ['/api/trades/all', selectedToken.symbol],
    queryFn: () => fetch(`/api/trades/all?token=${selectedToken.symbol}`).then(res => res.json()),
    refetchInterval: 3000, // Refresh every 3 seconds for live order flow
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
      toast({
        title: "Trade Executed",
        description: `Successfully ${data.type === 'buy' ? 'bought' : 'sold'} ${data.amount} ${selectedToken.symbol}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/history'] });
      refreshUser();
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
    <div className="max-w-sm mx-auto bg-background min-h-screen relative pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background opacity-50"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-flux-cyan opacity-5 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Header */}
      <header className="relative px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-flux-cyan to-flux-purple bg-clip-text text-transparent">
            Spot Trading
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Trade popular cryptocurrencies</p>
        </div>
      </header>

      {/* Token Selector */}
      <div className="relative px-6 mb-4">
        <Label className="text-sm text-muted-foreground mb-2 block">Select Token</Label>
        <Select value={selectedToken.symbol} onValueChange={(value) => {
          const token = SUPPORTED_TOKENS.find(t => t.symbol === value);
          if (token) setSelectedToken(token);
        }}>
          <SelectTrigger className="neo-card rounded-xl h-12">
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

      {/* TradingView Chart */}
      <div className="relative px-6 mb-6">
        <Card className="neo-card rounded-2xl overflow-hidden">
          <div id="tradingview_chart" style={{ height: '400px' }}></div>
        </Card>
      </div>

      {/* Current Price Card */}
      <div className="relative px-6 mb-6">
        <Card className="neo-card rounded-2xl p-6 hover:glow-bitcoin transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{selectedToken.name} Price</p>
              <p className="text-3xl font-bold text-foreground">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="text-xs">
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
                </Badge>
              </div>
            </div>
            <div className="w-16 h-16 rounded-xl bg-bitcoin bg-opacity-20 flex items-center justify-center">
              <TrendingUp className={`w-8 h-8 ${priceChange24h >= 0 ? 'text-emerald' : 'text-ruby'}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Display */}
      <div className="relative px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="neo-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">{selectedToken.symbol} Balance</p>
            <p className="text-lg font-bold text-foreground">{formatBitcoin(user.balance)}</p>
          </Card>
          <Card className="neo-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">USD Value</p>
            <p className="text-lg font-bold text-foreground">
              ${(parseFloat(user.balance) * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="relative px-6 mb-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card rounded-2xl p-1">
            <TabsTrigger 
              value="buy" 
              className="rounded-xl data-[state=active]:bg-emerald data-[state=active]:text-white"
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger 
              value="sell"
              className="rounded-xl data-[state=active]:bg-ruby data-[state=active]:text-white"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-6">
            <Card className="neo-card rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buy-amount" className="text-foreground">Amount ({selectedToken.symbol})</Label>
                  <Input
                    id="buy-amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="mt-2 font-mono"
                  />
                </div>

                <div className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per {selectedToken.symbol}</span>
                    <span className="text-foreground font-medium">${currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="text-foreground font-bold">${buyTotal}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBuy}
                  disabled={executeTradeMutation.isPending || !buyAmount}
                  className="w-full bg-emerald hover:bg-emerald/90 text-white font-semibold rounded-xl h-12 hover:scale-105 transition-all duration-300"
                >
                  {executeTradeMutation.isPending ? 'Processing...' : `Buy ${selectedToken.symbol}`}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Instant execution at market price</p>
                  <p>• Funds added to your wallet immediately</p>
                  <p>• No additional fees</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sell" className="mt-6">
            <Card className="neo-card rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sell-amount" className="text-foreground">Amount ({selectedToken.symbol})</Label>
                  <Input
                    id="sell-amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="mt-2 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Available: {formatBitcoin(user.balance)} {selectedToken.symbol}
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per {selectedToken.symbol}</span>
                    <span className="text-foreground font-medium">${currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Receive</span>
                    <span className="text-foreground font-bold">${sellTotal}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSell}
                  disabled={executeTradeMutation.isPending || !sellAmount}
                  className="w-full bg-ruby hover:bg-ruby/90 text-white font-semibold rounded-xl h-12 hover:scale-105 transition-all duration-300"
                >
                  {executeTradeMutation.isPending ? 'Processing...' : `Sell ${selectedToken.symbol}`}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Instant execution at market price</p>
                  <p>• Funds credited immediately</p>
                  <p>• No additional fees</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Book - Binance/Bybit Style */}
      <div className="relative px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-emerald" />
            Order Book
          </h3>
          <Badge variant="outline" className="text-xs">
            {allTrades?.length || 0} Live Orders
          </Badge>
        </div>
        
        <Card className="neo-card rounded-xl overflow-hidden">
          <div className="p-4">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border/50 text-xs text-muted-foreground font-medium">
              <div className="text-left">Price (USD)</div>
              <div className="text-right">Amount ({selectedToken.symbol})</div>
              <div className="text-right">Total (USD)</div>
            </div>

            {/* Asks (Sell Orders) - Red */}
            <ScrollArea className="h-48 mt-2">
              <div className="space-y-1">
                {allTrades && allTrades.length > 0 ? (
                  allTrades
                    .filter(trade => trade.type === 'sell')
                    .slice(0, 15)
                    .map((trade, index) => {
                      const amount = parseFloat(trade.amount);
                      const total = amount * currentPrice;
                      const depth = Math.min((amount / 10) * 100, 100); // Visual depth indicator
                      
                      return (
                        <div
                          key={trade.id}
                          className={`relative grid grid-cols-3 gap-2 py-1.5 px-2 text-sm hover:bg-ruby/5 transition-all ${
                            index === 0 ? 'animate-pulse' : ''
                          }`}
                        >
                          {/* Depth visualization */}
                          <div 
                            className="absolute right-0 top-0 bottom-0 bg-ruby/10 transition-all"
                            style={{ width: `${depth}%` }}
                          />
                          
                          <div className="text-ruby font-mono font-semibold relative z-10">
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
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No sell orders
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Current Price Ticker */}
            <div className="my-3 py-3 px-4 bg-gradient-to-r from-flux-cyan/10 to-flux-purple/10 rounded-lg border border-flux-cyan/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className={`text-2xl font-bold font-mono ${priceChange24h >= 0 ? 'text-emerald' : 'text-ruby'}`}>
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="text-xs">
                    {priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceChange24h).toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bids (Buy Orders) - Green */}
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {allTrades && allTrades.length > 0 ? (
                  allTrades
                    .filter(trade => trade.type === 'buy')
                    .slice(0, 15)
                    .map((trade, index) => {
                      const amount = parseFloat(trade.amount);
                      const total = amount * currentPrice;
                      const depth = Math.min((amount / 10) * 100, 100);
                      
                      return (
                        <div
                          key={trade.id}
                          className={`relative grid grid-cols-3 gap-2 py-1.5 px-2 text-sm hover:bg-emerald/5 transition-all ${
                            index === 0 ? 'animate-pulse' : ''
                          }`}
                        >
                          {/* Depth visualization */}
                          <div 
                            className="absolute right-0 top-0 bottom-0 bg-emerald/10 transition-all"
                            style={{ width: `${depth}%` }}
                          />
                          
                          <div className="text-emerald font-mono font-semibold relative z-10">
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
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No buy orders
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>

      {/* Your Trade History */}
      <div className="relative px-6 mb-20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Your Recent Trades</h3>
        <div className="space-y-3">
          {tradeHistory && tradeHistory.length > 0 ? (
            tradeHistory.slice(0, 5).map((trade) => (
              <Card key={trade.id} className="neo-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      trade.type === 'buy' 
                        ? 'bg-emerald bg-opacity-20' 
                        : 'bg-ruby bg-opacity-20'
                    }`}>
                      {trade.type === 'buy' ? (
                        <ArrowDownLeft className="w-5 h-5 text-emerald" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-ruby" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">{trade.type} {selectedToken.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatBitcoin(trade.amount)}</p>
                    <Badge variant={trade.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                      {trade.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="neo-card rounded-xl p-6 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No trade history yet</p>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
