
import { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { formatBitcoin } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useBitcoinPrice } from '@/hooks/use-bitcoin-price';
import { useCurrency } from '@/hooks/use-currency';

interface TradeOrder {
  id: number;
  type: 'buy' | 'sell';
  amount: string;
  price: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export default function Trade() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: bitcoinPrice } = useBitcoinPrice();
  const { currency } = useCurrency();

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // Get current price based on selected currency
  const currentPrice = bitcoinPrice 
    ? (currency === 'USD' ? bitcoinPrice.usd.price : bitcoinPrice.gbp.price)
    : 0;

  if (!user) {
    setLocation('/login');
    return null;
  }

  const { data: tradeHistory } = useQuery<TradeOrder[]>({
    queryKey: ['/api/trades/history', user?.id],
    queryFn: () => fetch(`/api/trades/history/${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
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
          price: currentPrice
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
        description: `Successfully ${data.type === 'buy' ? 'bought' : 'sold'} ${data.amount} BTC`,
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
    <div className="max-w-sm mx-auto bg-background min-h-screen relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background opacity-50"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-flux-cyan opacity-5 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Header */}
      <header className="relative px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-flux-cyan to-flux-purple bg-clip-text text-transparent">
            Spot Trading
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Buy and sell Bitcoin instantly</p>
        </div>
      </header>

      {/* Current Price Card */}
      <div className="relative px-6 mb-6">
        <Card className="neo-card rounded-2xl p-6 hover:glow-bitcoin transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bitcoin Price</p>
              <p className="text-3xl font-bold text-foreground">
                ${currentPrice.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-bitcoin bg-opacity-20 flex items-center justify-center">
              <Activity className="w-8 h-8 text-bitcoin" />
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Display */}
      <div className="relative px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="neo-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">BTC Balance</p>
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
                  <Label htmlFor="buy-amount" className="text-foreground">Amount (BTC)</Label>
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
                    <span className="text-muted-foreground">Price per BTC</span>
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
                  {executeTradeMutation.isPending ? 'Processing...' : 'Buy Bitcoin'}
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
                  <Label htmlFor="sell-amount" className="text-foreground">Amount (BTC)</Label>
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
                    Available: {formatBitcoin(user.balance)} BTC
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per BTC</span>
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
                  {executeTradeMutation.isPending ? 'Processing...' : 'Sell Bitcoin'}
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

      {/* Trade History */}
      <div className="relative px-6 mb-20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Trades</h3>
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
                      <p className="font-semibold text-foreground capitalize">{trade.type} BTC</p>
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
