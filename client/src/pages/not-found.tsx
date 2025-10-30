import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background dark:bg-background">
      <div className="w-full max-w-lg mx-4 text-center">
        {/* Animated 404 with gradient */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[120px] md:text-[160px] font-bold bg-gradient-to-r from-flux-cyan to-flux-purple bg-clip-text text-transparent leading-none">
              404
            </h1>
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
              <Zap className="w-12 h-12 md:w-16 md:h-16 text-flux-cyan animate-pulse" />
            </div>
          </div>
        </div>

        {/* Error message card */}
        <Card className="backdrop-blur-sm bg-card/50 border-border/50 shadow-lg">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-flux-cyan" />
              <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
            </div>
            
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
              Looks like this trading route doesn't exist. Let's get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setLocation('/')}
                className="bg-gradient-to-r from-flux-cyan to-flux-purple hover:opacity-90 text-white font-semibold rounded-xl px-6 shadow-lg hover:shadow-xl transition-all"
                data-testid="button-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-flux-cyan to-transparent" />
          <span>FluxTrade</span>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-flux-purple to-transparent" />
        </div>
      </div>
    </div>
  );
}
