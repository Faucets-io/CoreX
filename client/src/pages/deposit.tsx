
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Copy, Check, Wallet, Send, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { usdToBtc } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import type { TokenAddress } from "@shared/schema";

export default function Deposit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [selectedToken, setSelectedToken] = useState<"BTC" | "ETH" | "BNB">("BTC");
  const { data: priceData } = useBitcoinPrice();

  const { data: tokenAddresses } = useQuery<TokenAddress[]>({
    queryKey: [`/api/token-addresses/${user?.id}`],
    enabled: !!user?.id,
  });

  const submitDepositMutation = useMutation({
    mutationFn: async (data: { amount: string; transactionHash?: string }) => {
      const btcAmount = priceData ? usdToBtc(data.amount, priceData.usd.price) : data.amount;
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amount: btcAmount }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deposit failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Submitted",
        description: "Your deposit has been submitted and is pending confirmation.",
      });
      setAmount("");
      setTransactionHash("");
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Address Copied",
        description: `${type} address copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div>Please log in to access deposits</div>;
  }

  const btcAddress = tokenAddresses?.find(t => t.token === 'BTC')?.address || user.bitcoinAddress;
  const ethAddress = tokenAddresses?.find(t => t.token === 'ETH')?.address;
  const bnbAddress = tokenAddresses?.find(t => t.token === 'BNB')?.address;

  const tokens = [
    { symbol: "BTC", name: "Bitcoin", address: btcAddress, color: "bg-bitcoin" },
    { symbol: "ETH", name: "Ethereum", address: ethAddress, color: "bg-blue-500" },
    { symbol: "BNB", name: "Binance Coin", address: bnbAddress, color: "bg-yellow-500" },
  ];

  const currentToken = tokens.find(t => t.symbol === selectedToken);

  return (
    <AppLayout>
      <div className="min-h-screen dark-bg">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b dark-border">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation('/')}
                className="rounded-xl hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold dark-text">Deposit Crypto</h1>
                <p className="text-sm text-muted-foreground">Add funds to your wallet</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-sm mx-auto p-4 pb-24 space-y-6">
          {/* Token Selection */}
          <Card className="dark-card dark-border border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg dark-text">Select Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {tokens.map((token) => (
                  <Button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol as any)}
                    variant={selectedToken === token.symbol ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      selectedToken === token.symbol 
                        ? `${token.color} hover:${token.color}/90` 
                        : ""
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-xs font-semibold">{token.symbol}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deposit Address */}
          {currentToken && currentToken.address && (
            <Card className="dark-card dark-border border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 dark-text">
                  <div className={`w-8 h-8 rounded-lg ${currentToken.color}/20 flex items-center justify-center`}>
                    <Wallet className={`w-4 h-4 text-white`} />
                  </div>
                  Your {currentToken.name} Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2">Deposit Address</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={currentToken.address}
                        readOnly
                        className="text-xs font-mono bg-muted/30"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(currentToken.address!, currentToken.symbol)}
                        className="flex-shrink-0"
                      >
                        {copied === currentToken.symbol ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-foreground">Important:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Send only {currentToken.symbol} to this address</li>
                      <li>• Network: {currentToken.symbol === "BTC" ? "Bitcoin" : currentToken.symbol === "ETH" ? "Ethereum (ERC-20)" : "BNB Smart Chain (BEP-20)"}</li>
                      <li>• Minimum deposit: $10 USD</li>
                      <li>• Your balance updates after confirmation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Deposit */}
          <Card className="dark-card dark-border border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 dark-text">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-blue-500" />
                </div>
                Submit Deposit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-foreground">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5"
                  />
                  {amount && priceData?.usd?.price && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ≈ {usdToBtc(amount, priceData.usd.price)} BTC
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="txHash" className="text-foreground">Transaction Hash (Optional)</Label>
                  <Input
                    id="txHash"
                    placeholder="Enter your transaction hash"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Provide transaction hash after sending to speed up confirmation
                  </p>
                </div>
                <Button 
                  onClick={() => submitDepositMutation.mutate({ amount, transactionHash })}
                  disabled={!amount || submitDepositMutation.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300 group text-white font-semibold"
                >
                  {submitDepositMutation.isPending ? "Submitting..." : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Submit Deposit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="dark-card dark-border border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium dark-text mb-2">How to Deposit</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>1. Select your token (BTC, ETH, or BNB)</li>
                    <li>2. Copy your deposit address</li>
                    <li>3. Send crypto from your external wallet</li>
                    <li>4. Submit deposit form with amount</li>
                    <li>5. Wait for network confirmation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
