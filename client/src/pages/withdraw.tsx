
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Wallet, AlertCircle, Bitcoin } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatBitcoin, formatUsd, usdToBtc, btcToUsd } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { motion } from "framer-motion";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";

const cryptoLogos = [
  { name: "BTC", color: "#F7931A", delay: 0 },
  { name: "ETH", color: "#627EEA", delay: 0.5 },
  { name: "USDT", color: "#26A17B", delay: 1 },
  { name: "BNB", color: "#F3BA2F", delay: 1.5 },
  { name: "XRP", color: "#23292F", delay: 2 },
  { name: "SOL", color: "#14F195", delay: 2.5 },
];

export default function Withdraw() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: priceData } = useBitcoinPrice();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"usd" | "btc">("usd");
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

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
          color: 0xff5555,
          color2: 0xff3333,
          backgroundColor: 0x0a0a0a,
          size: 1.2,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

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
  const networkFee = "0.0001";

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center p-4">
      {/* Globe Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={vantaRef} className="absolute inset-0" style={{ opacity: 0.6 }} />
        
        {/* Floating crypto logos */}
        <div className="absolute inset-0 flex items-center justify-center">
          {cryptoLogos.map((crypto, index) => {
            const angle = (index / cryptoLogos.length) * 360;
            return (
              <motion.div
                key={crypto.name}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  marginLeft: "-24px",
                  marginTop: "-24px",
                }}
                animate={{
                  rotate: [angle, angle + 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: crypto.delay,
                }}
              >
                <motion.div
                  className="relative"
                  style={{
                    transform: `translateX(180px)`,
                  }}
                  animate={{
                    y: [0, -15, 0, 15, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: crypto.delay,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs border-2"
                    style={{
                      backgroundColor: `${crypto.color}20`,
                      borderColor: crypto.color,
                      boxShadow: `0 0 20px ${crypto.color}50`,
                      color: crypto.color,
                    }}
                  >
                    {crypto.name}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/30 z-10 w-full max-w-2xl"
        style={{
          boxShadow: "0 0 40px rgba(255, 85, 85, 0.2), inset 0 0 20px rgba(255, 85, 85, 0.05)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/')}
            className="border-red-500/30 hover:bg-red-500/10"
          >
            <ArrowLeft className="w-5 h-5 text-red-500" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-red-500">Withdraw Bitcoin</h1>
            <p className="text-red-500/60 mt-1">Send BTC to external address</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Balance Info */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Bitcoin className="w-5 h-5 text-white" />
                  <p className="text-sm text-red-100">Available Balance</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatUsd(balanceInUsd)}
                </p>
                <p className="text-sm text-red-100">
                  ≈ {formatBitcoin(user.balance)} BTC
                </p>
              </div>
            </div>
          </Card>

          {/* Withdrawal Form */}
          <Card className="border-red-500/20 bg-[#1A1A1A]/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-red-500">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-red-500" />
                </div>
                Withdrawal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="address" className="text-red-500">Bitcoin Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter BTC address (1... or 3... or bc1...)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5 font-mono text-sm bg-[#0A0A0A]/50 border-red-500/20 text-red-500"
                />
                <p className="text-xs text-red-500/60 mt-2">
                  Only send to a valid Bitcoin address
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="amount" className="text-red-500">Amount</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxAmount}
                    className="h-6 text-xs text-red-500 hover:text-red-500/80 hover:bg-red-500/10"
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
                    className="mt-1.5 pr-16 bg-[#0A0A0A]/50 border-red-500/20 text-red-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant={amountType === "usd" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAmountType("usd")}
                      className={`h-7 px-2 text-xs ${amountType === "usd" ? "bg-red-500 hover:bg-red-500/90" : "hover:bg-red-500/10"}`}
                    >
                      USD
                    </Button>
                    <Button
                      variant={amountType === "btc" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAmountType("btc")}
                      className={`h-7 px-2 text-xs ${amountType === "btc" ? "bg-red-500 hover:bg-red-500/90" : "hover:bg-red-500/10"}`}
                    >
                      BTC
                    </Button>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-[#0A0A0A]/50 rounded-lg space-y-1 border border-red-500/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500/60">Available:</span>
                    <span className="font-medium text-red-500">{formatUsd(balanceInUsd)}</span>
                  </div>
                  {amount && priceData?.usd?.price && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-500/60">Amount in BTC:</span>
                        <span className="font-medium text-red-500">{amountInBtc} BTC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-500/60">Network Fee:</span>
                        <span className="font-medium text-red-500">~{networkFee} BTC</span>
                      </div>
                      <div className="border-t border-red-500/10 pt-1 mt-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-red-500">You'll Receive:</span>
                          <span className="text-red-500">{(parseFloat(amountInBtc) - parseFloat(networkFee)).toFixed(8)} BTC</span>
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
                  className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-500/90 text-white shadow-lg transition-all duration-300 group font-semibold"
                  style={{
                    boxShadow: "0 0 20px rgba(255, 85, 85, 0.3)",
                  }}
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
          <Card className="border-red-500/20 bg-[#1A1A1A]/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500/60 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-500 mb-2">Important Information</h4>
                  <ul className="text-sm text-red-500/60 space-y-1.5">
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
      </motion.div>
    </div>
  );
}
