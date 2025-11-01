
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Send, Wallet, AlertCircle, Bitcoin } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatBitcoin, formatUsd, usdToBtc, btcToUsd } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { AppLayout } from "@/components/app-layout";

export default function Withdraw() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: priceData } = useBitcoinPrice();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"usd" | "btc">("usd");

  const withdrawMutation = useMutation({
    mutationFn: async (data: { address: string; amount: string }) => {
      const btcAmount = priceData?.usd?.price ? usdToBtc(data.amount, priceData.usd.price) : data.amount;
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amount: btcAmount }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process withdrawal");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for admin approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setAddress("");
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    if (!address || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both address and amount",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    const userBalanceUsd = priceData?.usd?.price ? btcToUsd(user?.balance || "0", priceData.usd.price) : parseFloat(user?.balance || "0");

    if (amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amountNum > userBalanceUsd) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ address, amount });
  };

  const handleMaxAmount = () => {
    if (user && priceData?.usd?.price) {
      const maxUsd = btcToUsd(user.balance, priceData.usd.price);
      setAmount(maxUsd.toString());
      setAmountType("usd");
    }
  };

  if (!user) {
    return <div>Please log in to access withdrawals</div>;
  }

  const balanceInUsd = priceData?.usd?.price ? btcToUsd(user.balance, priceData.usd.price) : 0;
  const amountInBtc = amount && priceData?.usd?.price ? usdToBtc(amount, priceData.usd.price) : "0";
  const networkFee = "0.0001"; // Example network fee

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
                <h1 className="text-2xl font-bold dark-text">Withdraw Bitcoin</h1>
                <p className="text-sm text-muted-foreground">Send BTC to external address</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-sm mx-auto p-4 pb-24 space-y-6">
          {/* Balance Info */}
          <Card className="dark-card dark-border overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-bitcoin to-orange-600 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Bitcoin className="w-5 h-5 text-white" />
                  <p className="text-sm text-orange-100">Available Balance</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatUsd(balanceInUsd)}
                </p>
                <p className="text-sm text-orange-100">
                  ≈ {formatBitcoin(user.balance)} BTC
                </p>
              </div>
            </div>
          </Card>

          {/* Withdrawal Form */}
          <Card className="dark-card dark-border border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 dark-text">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-red-500" />
                </div>
                Withdrawal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="address" className="text-foreground">Bitcoin Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter BTC address (1... or 3... or bc1...)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Only send to a valid Bitcoin address
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="amount" className="text-foreground">Amount</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxAmount}
                    className="h-6 text-xs text-bitcoin hover:text-bitcoin/80"
                  >
                    Max
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant={amountType === "usd" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAmountType("usd")}
                      className="h-7 px-2 text-xs"
                    >
                      USD
                    </Button>
                    <Button
                      variant={amountType === "btc" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAmountType("btc")}
                      className="h-7 px-2 text-xs"
                    >
                      BTC
                    </Button>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-muted/30 rounded-lg space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium text-foreground">{formatUsd(balanceInUsd)}</span>
                  </div>
                  {amount && priceData?.usd?.price && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Amount in BTC:</span>
                        <span className="font-medium text-foreground">{amountInBtc} BTC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Network Fee:</span>
                        <span className="font-medium text-foreground">~{networkFee} BTC</span>
                      </div>
                      <div className="border-t border-muted pt-1 mt-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-foreground">You'll Receive:</span>
                          <span className="text-foreground">{(parseFloat(amountInBtc) - parseFloat(networkFee)).toFixed(8)} BTC</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !address || !amount || !priceData?.usd?.price}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300 group text-white font-semibold"
                >
                  {withdrawMutation.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Request Withdrawal
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="dark-card dark-border border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium dark-text mb-2">Important Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Processing time: 1-24 hours</li>
                    <li>• Network fees are deducted from your amount</li>
                    <li>• Minimum withdrawal: $10 USD</li>
                    <li>• Double-check the Bitcoin address</li>
                    <li>• Transactions cannot be reversed</li>
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
