import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Key, FileText, Shield, Download, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

export default function ImportWallet() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [privateKey, setPrivateKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
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

  const importWalletMutation = useMutation({
    mutationFn: async (data: { type: 'privateKey' | 'seedPhrase'; value: string }) => {
      const res = await apiRequest("POST", "/api/import-wallet", {
        ...data,
        userId: user?.id
      });
      return res.json();
    },
    onSuccess: async () => {
      toast({
        title: "Wallet Imported Successfully",
        description: "Your wallet has been imported and balance updated.",
      });
      await refreshUser();
      setLocation('/home');
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed", 
        description: error.message || "Failed to import wallet",
        variant: "destructive",
      });
    },
  });

  const handleImportPrivateKey = () => {
    if (!privateKey.trim()) {
      toast({
        title: "Missing Private Key",
        description: "Please enter a valid private key",
        variant: "destructive",
      });
      return;
    }
    importWalletMutation.mutate({ type: 'privateKey', value: privateKey.trim() });
  };

  const handleImportSeedPhrase = () => {
    if (!seedPhrase.trim()) {
      toast({
        title: "Missing Seed Phrase",
        description: "Please enter a valid seed phrase",
        variant: "destructive",
      });
      return;
    }
    importWalletMutation.mutate({ type: 'seedPhrase', value: seedPhrase.trim() });
  };

  if (!user) {
    return <div>Please log in to import a wallet</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center p-4">
      {/* Globe Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={vantaRef} className="absolute inset-0" style={{ opacity: 0.6 }} />

        {/* Orbiting crypto logos */}
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
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: crypto.delay,
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
            onClick={() => setLocation('/wallet-setup')}
            className="border-[#00FF80]/30 hover:bg-[#00FF80]/10"
          >
            <ArrowLeft className="w-5 h-5 text-[#00FF80]" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#00FF80]">Import Wallet</h1>
            <p className="text-[#00FF80]/60 mt-1">Import your existing Bitcoin wallet</p>
          </div>
        </header>

        <Tabs defaultValue="private-key" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#0A0A0A]/50 border border-[#00FF80]/20">
            <TabsTrigger value="private-key" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
              Private Key
            </TabsTrigger>
            <TabsTrigger value="seed-phrase" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
              Seed Phrase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private-key" className="space-y-4 mt-6">
            <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00FF80]">
                  <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                    <Key className="w-4 h-4 text-[#00FF80]" />
                  </div>
                  Import Private Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="privateKey" className="text-[#00FF80]">Bitcoin Private Key (WIF Format)</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    placeholder="Enter private key (WIF: 5/K/L/c..., Hex: 64 chars, or 0x...)"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="mt-1.5 font-mono bg-[#0A0A0A]/50 border-[#00FF80]/20 text-[#00FF80]"
                  />
                </div>

                <Button 
                  onClick={handleImportPrivateKey}
                  disabled={importWalletMutation.isPending || !privateKey.trim()}
                  className="w-full bg-gradient-to-r from-[#00FF99] to-[#00CC66] hover:from-[#00FF99]/90 hover:to-[#00CC66]/90 text-black font-semibold"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 255, 128, 0.5)",
                  }}
                >
                  {importWalletMutation.isPending ? "Importing..." : "Import Private Key"}
                </Button>

                <div className="text-xs text-[#00FF80]/60 space-y-1 bg-[#00FF80]/5 p-3 rounded-lg border border-[#00FF80]/10">
                  <p>• Supports WIF, hex (64 chars), or 0x-prefixed formats</p>
                  <p>• Your funds will be accessible immediately</p>
                  <p>• Keep your private key secure</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seed-phrase" className="space-y-4 mt-6">
            <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00FF80]">
                  <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#00FF80]" />
                  </div>
                  Import Seed Phrase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seedPhrase" className="text-[#00FF80]">12 or 24 Word Seed Phrase</Label>
                  <Textarea
                    id="seedPhrase"
                    placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    className="mt-1.5 min-h-[100px] font-mono text-sm bg-[#0A0A0A]/50 border-[#00FF80]/20 text-[#00FF80]"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleImportSeedPhrase}
                  disabled={importWalletMutation.isPending || !seedPhrase.trim()}
                  className="w-full bg-gradient-to-r from-[#00FF99] to-[#00CC66] hover:from-[#00FF99]/90 hover:to-[#00CC66]/90 text-black font-semibold"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 255, 128, 0.5)",
                  }}
                >
                  {importWalletMutation.isPending ? "Importing..." : "Import Seed Phrase"}
                </Button>

                <div className="text-xs text-[#00FF80]/60 space-y-1 bg-[#00FF80]/5 p-3 rounded-lg border border-[#00FF80]/10">
                  <p>• Supports 12 or 24 word BIP39 seed phrases</p>
                  <p>• Words must be separated by spaces</p>
                  <p>• Compatible with most Bitcoin wallets (Electrum, Exodus, etc.)</p>
                  <p>• Example: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="border-[#00FF80]/20 bg-[#1A1A1A]/50 backdrop-blur mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#00FF80]/60 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-3 text-[#00FF80]">Security Notice</h3>
                <div className="space-y-2 text-xs text-[#00FF80]/60">
                  <p>• Your wallet data is encrypted and secure</p>
                  <p>• Only you have access to your funds</p>
                  <p>• Import is processed locally on your device</p>
                  <p>• We recommend backing up your wallet information</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}