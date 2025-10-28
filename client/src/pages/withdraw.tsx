
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Send, Wallet, AlertCircle } from "lucide-react";
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
        title: "Withdrawal Initiated",
        description: "Your withdrawal has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/');
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
        description: "You don't have enough USD for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ address, amount });
  };

  if (!user) {
    return <div>Please log in to access withdrawals</div>;
  }

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
                <h1 className="text-2xl font-bold dark-text">Withdraw Funds</h1>
                <p className="text-sm text-muted-foreground">Send funds to an external address</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-sm mx-auto p-4 pb-24">
          {/* Balance Info */}
          <Card className="dark-card dark-border mb-6 overflow-hidden">
            <div className="bitcoin-gradient p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-white" />
                  <p className="text-sm text-orange-100">Available Balance</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {priceData?.usd?.price ? formatUsd(btcToUsd(user.balance, priceData.usd.price)) : `${user.balance} BTC`}
                </p>
                <p className="text-sm text-orange-100 mt-1">
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
                <Label htmlFor="address" className="text-foreground">Destination Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter Bitcoin address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5"
                />
              </div>

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
                <p className="text-xs text-muted-foreground mt-2">
                  Available: {priceData?.usd?.price ? formatUsd(btcToUsd(user.balance, priceData.usd.price)) : `${user.balance} BTC`}
                </p>
                {amount && priceData?.usd?.price && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ {usdToBtc(amount, priceData.usd.price)} BTC
                  </p>
                )}
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
                      Withdraw Funds
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="dark-card dark-border border-0 shadow-lg mt-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium dark-text mb-2">Important Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Withdrawals are processed immediately</li>
                    <li>• Network fees will be deducted from your balance</li>
                    <li>• Minimum withdrawal: $10 USD</li>
                    <li>• Double-check the destination address</li>
                    <li>• Transactions cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
