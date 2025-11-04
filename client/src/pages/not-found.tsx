
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Zap, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-black" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF80] rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CCFF] rounded-full filter blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4 text-center px-6">
        {/* Animated 404 with gradient */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            <h1 className="text-[140px] md:text-[180px] font-black bg-gradient-to-r from-[#00FF80] via-[#00CCFF] to-[#00FF80] bg-clip-text text-transparent leading-none animate-pulse">
              404
            </h1>
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 animate-bounce">
              <Zap className="w-16 h-16 md:w-20 md:h-20 text-[#00FF80]" />
            </div>
          </div>
          
          {/* Glowing effect */}
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div className="w-full h-full bg-gradient-to-r from-[#00FF80] to-[#00CCFF]" />
          </div>
        </div>

        {/* Error message card */}
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-7 h-7 text-[#00FF80]" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Page Not Found</h2>
          </div>
          
          <p className="text-gray-400 mb-6 text-sm md:text-base leading-relaxed">
            Looks like this trading route doesn't exist. The market moves fast, but this page moved faster. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setLocation('/')}
              className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] hover:opacity-90 text-black font-bold rounded-xl px-8 py-6 shadow-lg shadow-[#00FF80]/20 transition-all"
              data-testid="button-home"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              className="bg-[#2A2A2A] text-[#00FF80] border-2 border-[#00FF80]/30 hover:bg-[#3A3A3A] hover:border-[#00FF80] font-bold rounded-xl px-8 py-6 transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex items-center justify-center gap-3 text-gray-500 text-sm">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#00FF80] to-transparent" />
          <span className="font-semibold">FluxTrade</span>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#00CCFF] to-transparent" />
        </div>

        {/* Additional hint */}
        <p className="mt-4 text-xs text-gray-600">
          Error Code: 404 • Page Not Found
        </p>
      </div>
    </div>
  );
}
