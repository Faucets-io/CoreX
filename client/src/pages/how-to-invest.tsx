
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";

export default function HowToInvest() {
  const [, setLocation] = useLocation();
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

  const steps = [
    {
      icon: Wallet,
      title: "Create Your Wallet",
      description: "Set up your secure FluxTrade wallet to get started with investing.",
      color: "#00FF99"
    },
    {
      icon: DollarSign,
      title: "Deposit Funds",
      description: "Add USDT to your wallet through our secure deposit system.",
      color: "#00CC66"
    },
    {
      icon: TrendingUp,
      title: "Choose a Plan",
      description: "Select from our investment plans with returns from 0.4% to 0.77% daily.",
      color: "#00FF99"
    },
    {
      icon: CheckCircle,
      title: "Earn Daily Profits",
      description: "Watch your investment grow with automated daily profit calculations.",
      color: "#00CC66"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            onClick={() => setLocation('/investment')}
            variant="ghost"
            size="sm"
            className="rounded-full"
            style={{ color: '#00FF99' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-2xl font-bold" style={{ 
            background: 'linear-gradient(90deg, #00FF99, #00CC66)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            How to Invest
          </div>
        </div>
      </header>

      {/* Hero Section with Globe */}
      <section className="relative h-[300px] overflow-hidden">
        <div ref={vantaRef} className="absolute inset-0" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
            background: 'linear-gradient(90deg, #00FF99, #00CC66)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Start Investing in 4 Simple Steps
          </h1>
          <p className="text-lg" style={{ color: '#BFBFBF' }}>
            Your journey to financial growth begins here
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="rounded-2xl border overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A',
                  boxShadow: '0 0 20px rgba(0, 255, 153, 0.1)',
                  animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                      style={{ 
                        backgroundColor: 'rgba(0, 255, 153, 0.1)',
                        border: '2px solid',
                        borderColor: step.color,
                        boxShadow: `0 0 20px ${step.color}40`
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ 
                            backgroundColor: step.color,
                            color: '#0A0A0A'
                          }}
                        >
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                          {step.title}
                        </h3>
                      </div>
                      <p style={{ color: '#BFBFBF' }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setLocation('/investment')}
            className="rounded-full px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform"
            style={{ 
              background: 'linear-gradient(90deg, #00FF99, #00CC66)',
              color: '#0A0A0A',
              boxShadow: '0 0 30px rgba(0, 255, 153, 0.4)'
            }}
          >
            Start Investing Now
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
