
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthContainer from "@/components/auth-container";
import FluxTradeLogo from "@/components/fluxtrade-logo";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        setLocation("/");
      } else {
        const error = await response.text();
        toast({
          title: "Login failed",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <motion.div
        className="relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#00FF80]/30"
        style={{
          boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <FluxTradeLogo className="h-12" />
        </div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Welcome Back
        </motion.h1>
        <p className="text-center text-gray-400 mb-8">
          Access your FluxTrade dashboard
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="bg-[#0A0A0A]/50 border-[#00FF80]/30 text-white placeholder:text-gray-500 focus:border-[#00FF80] focus:ring-[#00FF80]/50 transition-all"
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 128, 0.1)",
              }}
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm text-[#00CCFF] hover:text-[#00FF80] transition-colors"
            >
              Forgot Password?
            </button>
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
                Logging in...
              </>
            ) : (
              "Login"
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

        {/* Sign up link */}
        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => setLocation("/register")}
            className="text-[#00FF80] hover:text-[#00CCFF] font-semibold transition-colors"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </AuthContainer>
  );
}
