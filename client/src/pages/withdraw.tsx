import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatBitcoin, formatUsd, usdToBtc, btcToUsd } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";

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
      // Convert USD to BTC before sending
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
    // Assuming user balance is in BTC, convert to USD for comparison
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
    <div className="max-w-sm mx-auto bg-background min-h-screen relative">
      {/* Header */}
      <header className="px-4 py-6 border-b dark-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Withdraw Funds</h1>
            <p className="text-xs text-muted-foreground">Send funds to an external address</p>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Balance Info */}
        <Card className="dark-card dark-border mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-bitcoin">
              {priceData?.usd?.price ? formatUsd(btcToUsd(user.balance, priceData.usd.price)) : `${user.balance} BTC`}
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card className="dark-card dark-border">
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Destination Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter Bitcoin address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {priceData?.usd?.price ? formatUsd(btcToUsd(user.balance, priceData.usd.price)) : `${user.balance} BTC`}
              </p>
              {amount && priceData?.usd?.price && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {usdToBtc(amount, priceData.usd.price)} BTC
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || !address || !amount || !priceData?.usd?.price}
                className="w-full bg-bitcoin hover:bg-bitcoin/90 text-black font-semibold"
              >
                {withdrawMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>• Withdrawals are processed immediately</p>
              <p>• Network fees will be deducted from your balance</p>
              <p>• Minimum withdrawal: $10 USD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}