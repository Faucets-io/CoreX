import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Calendar, Percent, Zap, Rocket, Gem, Crown, Star, Trophy, Award, Diamond } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";

export default function ProfitPlans() {
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
          size: 1.5,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const plans = [
    {
      days: 1,
      rate: 40,
      totalReturn: 40,
      icon: Zap,
      gradient: "linear-gradient(135deg, #00FF99, #00CC66)"
    },
    {
      days: 7,
      rate: 7.142857,
      totalReturn: 50,
      icon: Rocket,
      gradient: "linear-gradient(135deg, #00CC66, #00FF99)"
    },
    {
      days: 14,
      rate: 4.285714,
      totalReturn: 60,
      icon: Gem,
      gradient: "linear-gradient(135deg, #00FF99, #00E680)"
    },
    {
      days: 28,
      rate: 2.5,
      totalReturn: 70,
      icon: Crown,
      gradient: "linear-gradient(135deg, #00E680, #00FF99)"
    },
    {
      days: 60,
      rate: 1.333333,
      totalReturn: 80,
      icon: Star,
      gradient: "linear-gradient(135deg, #00FF99, #00DD88)"
    },
    {
      days: 90,
      rate: 1,
      totalReturn: 90,
      icon: Trophy,
      gradient: "linear-gradient(135deg, #00DD88, #00FF99)"
    },
    {
      days: 180,
      rate: 0.555556,
      totalReturn: 100,
      icon: Award,
      gradient: "linear-gradient(135deg, #00FF99, #00BB77)"
    },
    {
      days: 360,
      rate: 0.388889,
      totalReturn: 140,
      icon: Diamond,
      gradient: "linear-gradient(135deg, #00BB77, #00FF99)"
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
            Profit Plans
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
            Investment Plans & Returns
          </h1>
          <p className="text-lg" style={{ color: '#BFBFBF' }}>
            Choose the plan that fits your investment goals
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className="rounded-2xl border-0 overflow-hidden transform hover:scale-[1.05] transition-all duration-300"
              style={{
                background: plan.gradient,
                boxShadow: '0 10px 40px rgba(0, 255, 153, 0.3)',
                animation: `fadeInScale 0.6s ease-out ${index * 0.15}s both`
              }}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-bounce" style={{ animationDuration: '2s' }}>
                    <plan.icon className="w-16 h-16 mx-auto" style={{ color: '#0A0A0A' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#0A0A0A' }}>
                    {plan.days} Day{plan.days > 1 ? 's' : ''} Plan
                  </h3>

                  <div className="space-y-4 mt-6">
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.3)' }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Percent className="w-5 h-5" style={{ color: '#0A0A0A' }} />
                        <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                          Daily Return
                        </span>
                      </div>
                      <div className="text-3xl font-bold" style={{ color: '#0A0A0A' }}>
                        {plan.rate.toFixed(2)}%
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'rgba(10, 10, 10, 0.7)' }}>
                        per day
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.3)' }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="w-5 h-5" style={{ color: '#0A0A0A' }} />
                        <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                          Total Return
                        </span>
                      </div>
                      <div className="text-3xl font-bold" style={{ color: '#0A0A0A' }}>
                        ${plan.totalReturn.toFixed(2)}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'rgba(10, 10, 10, 0.7)' }}>
                        after {plan.days} day{plan.days > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.3)' }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Calendar className="w-5 h-5" style={{ color: '#0A0A0A' }} />
                        <span className="text-sm font-medium" style={{ color: '#0A0A0A' }}>
                          Duration
                        </span>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>
                        {plan.days} Day{plan.days > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setLocation('/investment')}
                    className="w-full mt-6 py-6 text-lg font-semibold rounded-xl hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: '#0A0A0A',
                      color: '#00FF99',
                      border: 'none'
                    }}
                  >
                    Choose Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Example Calculation */}
        <Card
          className="rounded-2xl border mt-8 overflow-hidden"
          style={{
            backgroundColor: '#1A1A1A',
            borderColor: '#2A2A2A',
            boxShadow: '0 0 30px rgba(0, 255, 153, 0.2)'
          }}
        >
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#00FF99' }}>
              Example: $1,000 Investment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {plans.map((plan, index) => (
                <div key={index} className="text-center p-4 rounded-xl" style={{ backgroundColor: '#0A0A0A' }}>
                  <div className="text-sm mb-2" style={{ color: '#BFBFBF' }}>
                    {plan.days} Day{plan.days > 1 ? 's' : ''}
                  </div>
                  <div className="text-2xl font-bold" style={{ color: '#00FF99' }}>
                    ${(1000 * (1 + plan.totalReturn / 100)).toFixed(2)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#BFBFBF' }}>
                    +${(1000 * plan.totalReturn / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}