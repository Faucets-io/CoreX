import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Wallet, Plus, Download, Shield, Zap, Lock, Key } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FluxLogoHeader from "@/components/flux-logo-header";

export default function WalletSetup() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/create-wallet", { userId: user?.id });
      return res.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Wallet Created Successfully",
        description: `Your new Bitcoin wallet has been created. Seed phrase: ${data.seedPhrase}`,
        duration: 10000,
      });
      await refreshUser();
      setLocation('/home');
    },
    onError: (error: any) => {
      toast({
        title: "Wallet Creation Failed",
        description: error.message || "Failed to create wallet",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }

    if (user.hasWallet) {
      setLocation('/home');
    }
  }, [user, setLocation]);

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (user.hasWallet) {
    return <div>Redirecting to home...</div>;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-black" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FF80] rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00CCFF] rounded-full filter blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 pb-24">
        <div className="max-w-sm mx-auto px-6 pt-6">
          <FluxLogoHeader />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00FF80] to-[#00CCFF] flex items-center justify-center">
                <Wallet className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent">
                  Setup Wallet
                </h1>
                <p className="text-sm text-gray-400">Choose your preferred method</p>
              </div>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF80]/20 to-[#00CCFF]/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#00FF80]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to FluxTrade</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                To start using FluxTrade, you need to set up your Bitcoin wallet. Choose one of the secure options below to continue.
              </p>
            </div>
          </div>

          {/* Create New Wallet */}
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] overflow-hidden mb-6 group hover:border-[#00FF80] transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00FF80]/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#00FF80]" />
                </div>
                <h3 className="text-xl font-bold text-white">Create New Wallet</h3>
              </div>

              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Generate a new Bitcoin wallet with a fresh address and secure private key. Perfect for new users.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Zap className="w-4 h-4 text-[#00FF80]" />
                  <span>Generates unique Bitcoin address</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-4 h-4 text-[#00FF80]" />
                  <span>Secure private key creation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Wallet className="w-4 h-4 text-[#00FF80]" />
                  <span>Ready to receive Bitcoin instantly</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-[#00FF80]" />
                  <span>Fully managed and secured</span>
                </div>
              </div>

              <Button
                onClick={() => createWalletMutation.mutate()}
                disabled={createWalletMutation.isPending}
                className="w-full bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black font-bold hover:opacity-90 rounded-xl py-6 text-base"
              >
                {createWalletMutation.isPending ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Creating Wallet...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Wallet
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Import Existing Wallet */}
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] overflow-hidden mb-6 group hover:border-[#00CCFF] transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00CCFF]/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#00CCFF]" />
                </div>
                <h3 className="text-xl font-bold text-white">Import Existing Wallet</h3>
              </div>

              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Already have a Bitcoin wallet? Import it using your private key or seed phrase to access your existing funds.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Key className="w-4 h-4 text-[#00CCFF]" />
                  <span>Supports private keys & seed phrases</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Wallet className="w-4 h-4 text-[#00CCFF]" />
                  <span>Compatible with most Bitcoin wallets</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Download className="w-4 h-4 text-[#00CCFF]" />
                  <span>Access your existing balance</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-4 h-4 text-[#00CCFF]" />
                  <span>Secure import process</span>
                </div>
              </div>

              <Button
                onClick={() => setLocation('/import-wallet')}
                className="w-full bg-[#2A2A2A] text-[#00CCFF] border-2 border-[#00CCFF]/30 hover:bg-[#3A3A3A] hover:border-[#00CCFF] font-bold rounded-xl py-6 text-base transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Import Existing Wallet
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#00FF80]" />
              <h3 className="font-bold text-white">Security & Privacy</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF80] mt-1.5 flex-shrink-0" />
                <span>Industry-standard encryption protects your wallet</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF80] mt-1.5 flex-shrink-0" />
                <span>Private keys are never transmitted or shared</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF80] mt-1.5 flex-shrink-0" />
                <span>Only you have access to your Bitcoin funds</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF80] mt-1.5 flex-shrink-0" />
                <span>Regular security audits ensure your safety</span>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}