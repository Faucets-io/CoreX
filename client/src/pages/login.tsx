import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import fluxTradeLogo from "@assets/generated_images/FluxTrade_modern_logo_design_0d50e08c.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into your account.",
      });
      setTimeout(() => {
        setLocation('/');
      }, 100);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-flux-cyan/10 to-flux-purple/10 p-3 flex items-center justify-center">
            <img src={fluxTradeLogo} alt="FluxTrade" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:bg-gradient-to-r dark:from-flux-cyan dark:to-flux-purple dark:bg-clip-text dark:text-transparent">
            FluxTrade
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Smart Bitcoin Investments</p>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your investment dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="pl-11 h-12 rounded-xl border-border bg-card focus:border-flux-cyan transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="pl-11 pr-11 h-12 rounded-xl border-border bg-card focus:border-flux-cyan transition-colors"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-muted"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 gradient-primary text-black font-semibold rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">New to FluxTrade?</span>
            </div>
          </div>

          <Link href="/register">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl mt-6 border-flux-cyan text-flux-cyan hover:bg-flux-cyan hover:text-black transition-all duration-300 font-medium"
            >
              Create Your Account
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}