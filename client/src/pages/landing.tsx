
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { TrendingUp, Shield, Users, Zap, Star, ArrowRight, CheckCircle2, BarChart3, Wallet, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { NeonBackdrop } from "@/components/neon-backdrop";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const testimonialPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const investmentPlans = [
    {
      name: "Starter Plan",
      minAmount: "$100",
      roi: "5%",
      duration: "7 days",
      color: "from-blue-500 to-cyan-500",
      features: ["Daily returns", "Low risk", "Perfect for beginners"]
    },
    {
      name: "Growth Plan",
      minAmount: "$500",
      roi: "12%",
      duration: "30 days",
      color: "from-purple-500 to-pink-500",
      features: ["Higher returns", "Medium risk", "Balanced portfolio"]
    },
    {
      name: "Premium Plan",
      minAmount: "$2,000",
      roi: "25%",
      duration: "90 days",
      color: "from-emerald-500 to-teal-500",
      features: ["Maximum returns", "Managed risk", "Priority support"]
    },
    {
      name: "Elite Plan",
      minAmount: "$10,000",
      roi: "40%",
      duration: "180 days",
      color: "from-orange-500 to-red-500",
      features: ["Premium returns", "Expert management", "VIP benefits"]
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
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span style={{ 
                  background: 'linear-gradient(90deg, #00FF99, #00CC66)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  FluxTrade
                </span>
              </h1>
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

      {/* Investment Plans Carousel */}
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
              Investment Plans
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the perfect plan that matches your investment goals
            </p>
          </motion.div>

          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-5xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {investmentPlans.map((plan, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <Card className={`bg-gradient-to-br ${plan.color} border-0 overflow-hidden hover:scale-105 transition-transform duration-300`}>
                      <CardContent className="p-6 text-white">
                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-bold">{plan.name}</h3>
                          <div className="space-y-2">
                            <div className="text-4xl font-bold">{plan.roi}</div>
                            <div className="text-sm opacity-90">ROI in {plan.duration}</div>
                          </div>
                          <div className="text-lg font-semibold">
                            Min. Investment: {plan.minAmount}
                          </div>
                          <div className="space-y-2 pt-4">
                            {plan.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => setLocation('/register')}
                            className="w-full mt-4 bg-white text-black hover:bg-gray-100"
                          >
                            Get Started
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
    </div>
  );
}
