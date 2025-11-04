
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { TrendingUp, Shield, Users, Zap, Star, ArrowRight, CheckCircle2, BarChart3, Wallet, Lock, Globe, Calendar, Percent, Rocket, Gem, Crown, Trophy, Award, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { NeonBackdrop } from "@/components/neon-backdrop";
import FluxTradeLogo from "@/components/fluxtrade-logo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const testimonialPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const [calculatorAmount, setCalculatorAmount] = useState<string>("1000");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      rate: 11.428571,
      totalReturn: 80,
      icon: Rocket,
      gradient: "linear-gradient(135deg, #00CC66, #00FF99)"
    },
    {
      days: 14,
      rate: 11.428571,
      totalReturn: 160,
      icon: Gem,
      gradient: "linear-gradient(135deg, #00FF99, #00E680)"
    },
    {
      days: 28,
      rate: 12.142857,
      totalReturn: 340,
      icon: Crown,
      gradient: "linear-gradient(135deg, #00E680, #00FF99)"
    },
    {
      days: 60,
      rate: 11.333333,
      totalReturn: 680,
      icon: Star,
      gradient: "linear-gradient(135deg, #00FF99, #00DD88)"
    },
    {
      days: 90,
      rate: 15.111111,
      totalReturn: 1360,
      icon: Trophy,
      gradient: "linear-gradient(135deg, #00DD88, #00FF99)"
    },
    {
      days: 180,
      rate: 15.111111,
      totalReturn: 2720,
      icon: Award,
      gradient: "linear-gradient(135deg, #00FF99, #00BB77)"
    },
    {
      days: 360,
      rate: 15.111111,
      totalReturn: 5440,
      icon: Diamond,
      gradient: "linear-gradient(135deg, #00BB77, #00FF99)"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Trader",
      image: "SJ",
      content: "FluxTrade has transformed my investment strategy. The returns are consistent and the platform is incredibly user-friendly.",
      rating: 5,
      profit: "+$45,000"
    },
    {
      name: "Michael Chen",
      role: "Crypto Investor",
      image: "MC",
      content: "I've been using FluxTrade for 6 months and the results speak for themselves. Best investment decision I've made.",
      rating: 5,
      profit: "+$32,500"
    },
    {
      name: "Emily Rodriguez",
      role: "Day Trader",
      image: "ER",
      content: "The trading tools are professional-grade and the investment plans deliver exactly what they promise. Highly recommended!",
      rating: 5,
      profit: "+$58,200"
    },
    {
      name: "David Thompson",
      role: "Portfolio Manager",
      image: "DT",
      content: "Transparent, reliable, and profitable. FluxTrade has exceeded all my expectations in cryptocurrency trading.",
      rating: 5,
      profit: "+$78,900"
    },
    {
      name: "Lisa Wang",
      role: "Financial Analyst",
      image: "LW",
      content: "The automated trading features and investment plans make it easy to grow wealth passively. Outstanding platform!",
      rating: 5,
      profit: "+$41,300"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds are protected with military-grade encryption and multi-layer security protocols."
    },
    {
      icon: TrendingUp,
      title: "Proven Returns",
      description: "Track record of consistent profits with transparent reporting and real-time analytics."
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Lightning-fast trades and instant profit withdrawals to your wallet."
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 dedicated support team ready to assist with your investment journey."
    }
  ];

  const stats = [
    { value: "2.5M+", label: "Active Users" },
    { value: "$500M+", label: "Trading Volume" },
    { value: "98.7%", label: "Success Rate" },
    { value: "150+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A', overflow: 'hidden' }}>
      <NeonBackdrop />
      
      {/* Hero Section with Advanced Globe Animation */}
      <section className="relative z-10 min-h-screen flex items-center overflow-hidden">
        {/* Advanced Globe Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="relative w-[600px] h-[600px]"
            animate={{
              rotateY: mousePosition.x * 10,
              rotateX: -mousePosition.y * 10,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 opacity-20"
              style={{ borderColor: '#00FF99' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle rotating ring */}
            <motion.div
              className="absolute inset-8 rounded-full border-2 opacity-30"
              style={{ borderColor: '#00CCFF' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner pulsing core */}
            <motion.div
              className="absolute inset-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0, 255, 153, 0.3) 0%, rgba(0, 204, 102, 0.1) 50%, transparent 70%)',
                filter: 'blur(40px)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Orbiting particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #00FF99, #00CCFF)',
                  boxShadow: '0 0 10px rgba(0, 255, 153, 0.8)',
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos((i / 12) * Math.PI * 2) * 250,
                  y: Math.sin((i / 12) * Math.PI * 2) * 250,
                }}
                transition={{
                  rotate: { duration: 10 + i, repeat: Infinity, ease: "linear" },
                  x: { duration: 10 + i, repeat: Infinity, ease: "linear" },
                  y: { duration: 10 + i, repeat: Infinity, ease: "linear" }
                }}
              />
            ))}

            {/* Network grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FF99" />
                  <stop offset="100%" stopColor="#00CCFF" />
                </linearGradient>
              </defs>
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx="300"
                  cy="300"
                  r={50 + i * 40}
                  fill="none"
                  stroke="url(#gridGradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
                />
              ))}
            </svg>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* FluxTrade Logo */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <FluxTradeLogo className="h-20 sm:h-24 lg:h-28" animated={true} />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Your Trusted Partner in
                <br />
                <span style={{ color: '#00FF99' }}>Crypto Investment & Trading</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
                Join millions of investors worldwide who trust FluxTrade for secure, profitable cryptocurrency trading and investment opportunities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={() => setLocation('/register')}
                size="lg"
                className="text-lg px-8 py-6 rounded-full font-semibold hover:scale-105 transition-transform"
                style={{ 
                  background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                  color: '#0A0A0A',
                  boxShadow: '0 0 30px rgba(0, 255, 153, 0.4)'
                }}
              >
                Start Investing Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => setLocation('/login')}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full font-semibold hover:scale-105 transition-transform"
                style={{ 
                  borderColor: '#00FF99',
                  color: '#00FF99',
                  backgroundColor: 'transparent'
                }}
              >
                Sign In
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 pt-8"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-300">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-300">Bank-Level Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-300">Global Platform</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: '#00FF99' }}>
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculator */}
      <section className="relative z-10 py-20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Investment Calculator
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Calculate your potential returns across all investment plans
            </p>
          </motion.div>

          <Card
            className="rounded-2xl border max-w-4xl mx-auto mb-8"
            style={{
              backgroundColor: '#1A1A1A',
              borderColor: '#2A2A2A',
              boxShadow: '0 0 30px rgba(0, 255, 153, 0.2)'
            }}
          >
            <CardContent className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#00FF99' }}>
                  Enter Investment Amount ($)
                </label>
                <Input
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(e.target.value)}
                  placeholder="1000"
                  className="text-2xl font-bold text-center py-6"
                  style={{
                    backgroundColor: '#0A0A0A',
                    borderColor: '#00FF99',
                    color: '#00FF99'
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {plans.map((plan, index) => {
                  const amount = parseFloat(calculatorAmount) || 0;
                  const profit = amount * (plan.totalReturn / 100);
                  const total = amount + profit;
                  
                  return (
                    <div 
                      key={index} 
                      className="text-center p-4 rounded-xl hover:scale-105 transition-transform" 
                      style={{ backgroundColor: '#0A0A0A' }}
                    >
                      <div className="text-sm mb-2" style={{ color: '#BFBFBF' }}>
                        {plan.days} Day{plan.days > 1 ? 's' : ''}
                      </div>
                      <div className="text-2xl font-bold" style={{ color: '#00FF99' }}>
                        ${total.toFixed(2)}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#BFBFBF' }}>
                        +${profit.toFixed(2)}
                      </div>
                      <div className="text-xs mt-2" style={{ color: '#00FF99' }}>
                        {plan.totalReturn}% ROI
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Investment Plans & Returns
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your investment goals
            </p>
          </motion.div>

          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-6xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {plans.map((plan, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                  <div className="p-2">
                    <Card
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
                            onClick={() => setLocation('/register')}
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
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Why Choose FluxTrade?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Trusted by millions for secure and profitable cryptocurrency trading
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border" style={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.8)',
                  borderColor: 'rgba(0, 255, 153, 0.2)',
                  boxShadow: '0 0 20px rgba(0, 255, 153, 0.1)'
                }}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 255, 153, 0.1)' }}
                    >
                      <feature.icon className="w-8 h-8" style={{ color: '#00FF99' }} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real stories from real investors achieving real results
            </p>
          </motion.div>

          <Carousel
            plugins={[testimonialPlugin.current]}
            className="w-full max-w-5xl mx-auto"
            onMouseEnter={testimonialPlugin.current.stop}
            onMouseLeave={testimonialPlugin.current.reset}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <Card className="border hover:scale-105 transition-transform duration-300" style={{ 
                      backgroundColor: 'rgba(26, 26, 26, 0.9)',
                      borderColor: 'rgba(0, 255, 153, 0.2)',
                      boxShadow: '0 0 20px rgba(0, 255, 153, 0.1)'
                    }}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                            style={{ 
                              backgroundColor: 'rgba(0, 255, 153, 0.2)',
                              color: '#00FF99'
                            }}
                          >
                            {testimonial.image}
                          </div>
                          <div>
                            <div className="font-bold text-white">{testimonial.name}</div>
                            <div className="text-sm text-gray-400">{testimonial.role}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-300 italic">"{testimonial.content}"</p>
                        <div className="pt-2 font-bold text-lg" style={{ color: '#00FF99' }}>
                          {testimonial.profit} profit
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20" style={{ backgroundColor: 'rgba(0, 255, 153, 0.05)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join millions of investors and start building your wealth today
            </p>
            <Button
              onClick={() => setLocation('/register')}
              size="lg"
              className="text-xl px-12 py-8 rounded-full font-semibold hover:scale-105 transition-transform"
              style={{ 
                background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                color: '#0A0A0A',
                boxShadow: '0 0 40px rgba(0, 255, 153, 0.5)'
              }}
            >
              Create Free Account
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t" style={{ borderColor: 'rgba(0, 255, 153, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2024 FluxTrade. All rights reserved. Trusted by millions worldwide.</p>
        </div>
      </footer>

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
