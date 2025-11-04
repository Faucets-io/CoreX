import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthContainer from "@/components/auth-container";
import FluxTradeLogo from "@/components/fluxtrade-logo";
import CryptoJetIcon from "@/components/crypto-jet-icon";
import { Loader2 } from "lucide-react";
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

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "⚠️ Passwords Don't Match",
        description: "Please ensure both password fields are identical",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast({
          title: "✓ Account Created!",
          description: "Registration successful",
        });
        setLocation("/");
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "⚠️ Registration Failed",
          description: error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "⚠️ Registration Error",
        description: "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
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

      <motion.div
        className="relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#00FF80]/30 z-10"
        style={{
          boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Logo with Crypto Jet */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="w-8 h-8">
            <svg
              width="32"
              height="32"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z"
                fill="#00FF80"
                stroke="#00CC66"
                strokeWidth="2"
              />
              <path
                d="M 60 80 L 30 90 L 40 100 L 60 95 Z"
                fill="#00CC66"
                stroke="#00CC66"
                strokeWidth="1.5"
              />
              <path
                d="M 140 80 L 170 90 L 160 100 L 140 95 Z"
                fill="#00CC66"
                stroke="#00CC66"
                strokeWidth="1.5"
              />
              <ellipse
                cx="100"
                cy="70"
                rx="15"
                ry="12"
                fill="#00CCFF"
                opacity="0.6"
              />
              <circle cx="85" cy="150" r="6" fill="#00FF80" />
              <circle cx="115" cy="150" r="6" fill="#00FF80" />
              <text
                x="100"
                y="105"
                fontFamily="Orbitron, sans-serif"
                fontSize="14"
                fontWeight="700"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                FT
              </text>
            </svg>
          </div>
          <FluxTradeLogo className="h-12" />
        </div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Create Your Account
        </motion.h1>
        <p className="text-center text-gray-400 mb-8">
          Join FluxTrade and start trading
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white placeholder:text-gray-500 focus:border-[#00FF80] focus:ring-[#00FF80]/50 transition-all"
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 128, 0.1)",
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white placeholder:text-gray-500 focus:border-[#00FF80] focus:ring-[#00FF80]/50 transition-all"
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 128, 0.1)",
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white placeholder:text-gray-500 focus:border-[#00FF80] focus:ring-[#00FF80]/50 transition-all"
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 128, 0.1)",
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white placeholder:text-gray-500 focus:border-[#00FF80] focus:ring-[#00FF80]/50 transition-all"
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 128, 0.1)",
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00FF99] to-[#00CC66] hover:from-[#00FF99]/90 hover:to-[#00CC66]/90 text-black font-semibold transition-all"
            style={{
              boxShadow: "0 0 20px rgba(0, 255, 128, 0.5)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#1A1A1A] text-gray-400">or</span>
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => setLocation("/login")}
            className="text-[#00FF80] hover:text-[#00CCFF] font-semibold transition-colors"
          >
            Login
          </button>
        </p>
      </motion.div>
    </AuthContainer>
  );
}