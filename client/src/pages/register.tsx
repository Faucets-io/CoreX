import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, RefreshCw } from "lucide-react";
import { FluxTradeLogo } from "@/components/fluxtrade-logo";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Puzzle verification state
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [puzzleQuestion, setPuzzleQuestion] = useState({ question: "", answer: 0 });
  const [isPuzzleVerified, setIsPuzzleVerified] = useState(false);

  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Generate a simple math puzzle
  const generatePuzzle = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let answer = 0;
    let question = "";

    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
    }

    setPuzzleQuestion({ question, answer });
    setPuzzleAnswer("");
    setIsPuzzleVerified(false);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const verifyPuzzle = () => {
    if (parseInt(puzzleAnswer) === puzzleQuestion.answer) {
      setIsPuzzleVerified(true);
      toast({
        title: "Verification successful!",
        description: "You can now complete your registration.",
      });
    } else {
      toast({
        title: "Incorrect answer",
        description: "Please try again.",
        variant: "destructive",
      });
      generatePuzzle();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPuzzleVerified) {
      toast({
        title: "Verification required",
        description: "Please solve the puzzle to verify you're human.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      toast({
        title: "Account created successfully!",
        description: "Please set up your wallet to start investing.",
      });
      setLocation('/wallet-setup');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unable to create account. Please try again.",
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
            <FluxTradeLogo className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:bg-gradient-to-r dark:from-flux-cyan dark:to-flux-purple dark:bg-clip-text dark:text-transparent">
            FluxTrade
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Smart Bitcoin Investments</p>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Start Investing Today</h2>
          <p className="text-muted-foreground">Create your account and get instant access to Bitcoin investments</p>
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
                placeholder="Create a strong password"
                minLength={6}
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
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                minLength={6}
                className="pl-11 pr-11 h-12 rounded-xl border-border bg-card focus:border-flux-cyan transition-colors"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-muted"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Bot Verification Puzzle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verify You're Human
            </Label>
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm text-muted-foreground">
                  What is <span className="font-bold text-foreground text-lg">{puzzleQuestion.question}</span>?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg"
                  onClick={generatePuzzle}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={puzzleAnswer}
                  onChange={(e) => setPuzzleAnswer(e.target.value)}
                  placeholder="Your answer"
                  disabled={isPuzzleVerified}
                  className="h-10 rounded-lg"
                />
                {!isPuzzleVerified ? (
                  <Button
                    type="button"
                    onClick={verifyPuzzle}
                    className="h-10 px-6 rounded-lg"
                    variant="outline"
                  >
                    Verify
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium">
                    ✓ Verified
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 gradient-primary text-black font-semibold rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg group"
            disabled={isLoading || !isPuzzleVerified}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Create Account</span>
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
              <span className="px-4 bg-background text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl mt-6 border-flux-cyan text-flux-cyan hover:bg-flux-cyan hover:text-black transition-all duration-300 font-medium"
            >
              Sign In Instead
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}