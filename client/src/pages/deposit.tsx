import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Check, Wallet, Send, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { usdToBtc } from "@/lib/utils";
import type { TokenAddress } from "@shared/schema";
import { motion } from "framer-motion";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";
import FluxLogoHeader from "@/components/flux-logo-header";

const cryptoLogos = [
  { name: "BTC", color: "#F7931A", delay: 0 },
  { name: "ETH", color: "#627EEA", delay: 0.5 },
  { name: "USDT", color: "#26A17B", delay: 1 },
  { name: "BNB", color: "#F3BA2F", delay: 1.5 },
  { name: "XRP", color: "#23292F", delay: 2 },
  { name: "SOL", color: "#14F195", delay: 2.5 },
];

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
          color: 0x00ff99,
          color2: 0x00cc66,
          backgroundColor: 0x0a0a0a,
          size: 1.2,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

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
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center p-4">
      {/* Globe Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={vantaRef} className="absolute inset-0" style={{ opacity: 0.6 }} />

        {/* Bouncing crypto logos */}
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
                    y: [0, -30, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
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
        className="relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#00FF80]/30 z-10 w-full max-w-2xl"
        style={{
          boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <FluxLogoHeader />

        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/')}
            className="border-[#00FF80]/30 hover:bg-[#00FF80]/10"
          >
            <ArrowLeft className="w-5 h-5 text-[#00FF80]" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#00FF80]">Deposit Crypto</h1>
            <p className="text-[#00FF80]/60 mt-1">Add funds to your wallet</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Token Selection */}
          <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#00FF80]">Select Token</CardTitle>
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
                        ? `bg-[#00FF80] hover:bg-[#00FF80]/90 text-[#0A0A0A]` 
                        : "border-[#00FF80]/20 hover:bg-[#00FF80]/10"
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
            <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[#00FF80]">
                  <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-[#00FF80]" />
                  </div>
                  Your {currentToken.name} Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-[#00FF80]/60 mb-2">Deposit Address</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={currentToken.address}
                        readOnly
                        className="text-xs font-mono bg-[#0A0A0A]/50 border-[#00FF80]/20 text-[#00FF80]"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(currentToken.address!, currentToken.symbol)}
                        className="flex-shrink-0 border-[#00FF80]/30 hover:bg-[#00FF80]/10"
                      >
                        {copied === currentToken.symbol ? <Check className="w-4 h-4 text-[#00FF80]" /> : <Copy className="w-4 h-4 text-[#00FF80]" />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0A]/50 p-4 rounded-lg space-y-2 border border-[#00FF80]/10">
                    <p className="text-xs font-semibold text-[#00FF80]">Important:</p>
                    <ul className="text-xs text-[#00FF80]/60 space-y-1">
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
          <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[#00FF80]">
                <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#00FF80]" />
                </div>
                Submit Deposit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-[#00FF80]">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 bg-[#0A0A0A]/50 border-[#00FF80]/20 text-[#00FF80]"
                  />
                  {amount && priceData?.usd?.price && (
                    <p className="text-xs text-[#00FF80]/60 mt-2">
                      ≈ {usdToBtc(amount, priceData.usd.price)} BTC
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="txHash" className="text-[#00FF80]">Transaction Hash (Optional)</Label>
                  <Input
                    id="txHash"
                    placeholder="Enter your transaction hash"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    className="mt-1.5 bg-[#0A0A0A]/50 border-[#00FF80]/20 text-[#00FF80]"
                  />
                  <p className="text-xs text-[#00FF80]/60 mt-2">
                    Provide transaction hash after sending to speed up confirmation
                  </p>
                </div>
                <Button 
                  onClick={() => submitDepositMutation.mutate({ amount, transactionHash })}
                  disabled={!amount || submitDepositMutation.isPending}
                  className="w-full h-12 rounded-xl bg-[#00FF80] hover:bg-[#00FF80]/90 text-[#0A0A0A] shadow-lg transition-all duration-300 group font-semibold"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 255, 128, 0.3)",
                  }}
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
          <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#00FF80]/60 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#00FF80] mb-2">How to Deposit</h4>
                  <ul className="text-sm text-[#00FF80]/60 space-y-1.5">
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
      </motion.div>
    </div>
  );
}