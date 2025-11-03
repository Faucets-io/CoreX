
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Clock, Zap, TrendingUp, Users, Award, BarChart3, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";

export default function InvestmentMore() {
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
          size: 1.3,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const features = [
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-level security with advanced encryption to protect your investments.",
      color: "#00FF99"
    },
    {
      icon: Clock,
      title: "Instant Withdrawals",
      description: "Access your profits anytime with our fast withdrawal system.",
      color: "#00CC66"
    },
    {
      icon: Zap,
      title: "Automated Returns",
      description: "Daily profits calculated and credited automatically to your account.",
      color: "#00FF99"
    },
    {
      icon: TrendingUp,
      title: "Transparent Trading",
      description: "Real-time market data and complete transparency in all operations.",
      color: "#00CC66"
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Our dedicated team is always ready to help you succeed.",
      color: "#00FF99"
    },
    {
      icon: Award,
      title: "Proven Track Record",
      description: "Trusted by thousands of investors worldwide since our launch.",
      color: "#00CC66"
    }
  ];

  const stats = [
    { label: "Active Investors", value: "10,000+", icon: Users },
    { label: "Total Invested", value: "$50M+", icon: BarChart3 },
    { label: "Daily Transactions", value: "5,000+", icon: Zap },
    { label: "Avg. Return Rate", value: "0.65%", icon: TrendingUp }
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
            Why FluxTrade
          </div>
        </div>
      </header>

      {/* Hero Section with Globe */}
      <section className="relative h-[350px] overflow-hidden">
        <div ref={vantaRef} className="absolute inset-0" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ 
            background: 'linear-gradient(90deg, #00FF99, #00CC66)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            The Future of Smart Investing
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: '#BFBFBF' }}>
            Join thousands of investors earning consistent daily returns with our proven investment platform
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="rounded-2xl border overflow-hidden transform hover:scale-105 transition-all duration-300"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A',
                  boxShadow: '0 0 20px rgba(0, 255, 153, 0.1)',
                  animation: `popIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: '#00FF99' }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: '#BFBFBF' }}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Grid */}
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ 
          background: 'linear-gradient(90deg, #00FF99, #00CC66)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Platform Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="rounded-2xl border overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A',
                  boxShadow: '0 0 20px rgba(0, 255, 153, 0.1)',
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <CardContent className="p-6">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ 
                      backgroundColor: 'rgba(0, 255, 153, 0.1)',
                      border: '2px solid',
                      borderColor: feature.color,
                      boxShadow: `0 0 20px ${feature.color}40`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#BFBFBF' }}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Notice */}
        <Card
          className="rounded-2xl border overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.1), rgba(0, 204, 102, 0.1))',
            borderColor: '#00FF99',
            boxShadow: '0 0 30px rgba(0, 255, 153, 0.2)'
          }}
        >
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: '#00FF99' }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
              Your Security is Our Priority
            </h3>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#BFBFBF' }}>
              We use advanced encryption, multi-factor authentication, and cold storage to ensure your investments are always protected.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => setLocation('/investment')}
            className="rounded-full px-10 py-7 text-xl font-semibold hover:scale-105 transition-transform shadow-2xl"
            style={{ 
              background: 'linear-gradient(90deg, #00FF99, #00CC66)',
              color: '#0A0A0A',
              boxShadow: '0 0 40px rgba(0, 255, 153, 0.5)'
            }}
          >
            Start Investing Today
          </Button>
          <p className="mt-4 text-sm" style={{ color: '#BFBFBF' }}>
            Join thousands of successful investors on FluxTrade
          </p>
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
        
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5);
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
