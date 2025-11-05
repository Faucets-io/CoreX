
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FluxTradeLogo from "@/components/fluxtrade-logo";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function AdminMarketing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isBackdoorAccess = window.location.pathname === '/Hello10122' || 
                          window.location.pathname.includes('/Hello10122') ||
                          sessionStorage.getItem('backdoorAccess') === 'true';

  if (!user?.isAdmin && !isBackdoorAccess && user !== null) {
    setLocation('/home');
    return null;
  }

  const downloadSVG = (elementId: string, filename: string) => {
    const svgElement = document.getElementById(elementId);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    toast({
      title: "Downloaded",
      description: `${filename} has been downloaded successfully`,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00FF80]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00CCFF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pb-24">
        <div className="max-w-6xl mx-auto px-6 pt-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => setLocation('/Hello10122')}
              variant="ghost"
              size="sm"
              className="rounded-full text-[#00FF80] hover:bg-[#00FF80]/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent">
                Marketing Materials
              </h1>
              <p className="text-sm text-gray-400">10 Banner variations + 5 Poster designs for FluxTrade</p>
            </div>
          </div>

          {/* BANNERS */}
          <h2 className="text-3xl font-bold text-white mb-6">Banners (1200x400)</h2>

          {/* Banner 1 - Original with 10,000+ investors */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 1 - Join Happy Investors</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-1', 'fluxtrade-banner-1.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-1" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0A0A0A" />
                      <stop offset="50%" stopColor="#1A1A1A" />
                      <stop offset="100%" stopColor="#0A0A0A" />
                    </linearGradient>
                    <linearGradient id="fluxGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00FF80" />
                      <stop offset="100%" stopColor="#00CCFF" />
                    </linearGradient>
                    <filter id="glow1">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="circleGlow1" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00FF80" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00FF80" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="1200" height="400" fill="url(#bgGrad1)" />
                  <circle cx="200" cy="200" r="150" fill="url(#circleGlow1)" />
                  <circle cx="1000" cy="200" r="150" fill="url(#circleGlow1)" />
                  <g transform="translate(150, 120)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow1)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow1)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <ellipse cx="100" cy="70" rx="15" ry="12" fill="#00CCFF" opacity="0.6" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <text x="100" y="105" fontFamily="Orbitron, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>
                  <g transform="translate(450, 140)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="220" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="240" fontFamily="Orbitron, sans-serif" fontSize="28" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">Join 10,000+ Happy Investors</text>
                  <g transform="translate(300, 280)">
                    <text x="0" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00FF80">✓ Secure Trading</text>
                    <text x="250" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00FF80">✓ Real-time Charts</text>
                    <text x="520" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00FF80">✓ Multiple Coins</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 2 - Trade Smarter */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 2 - Trade Smarter</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-2', 'fluxtrade-banner-2.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-2" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="#0A0A0A" />
                  <circle cx="150" cy="200" r="180" fill="url(#circleGlow1)" />
                  <circle cx="1050" cy="200" r="180" fill="url(#circleGlow1)" />
                  <g transform="translate(80, 100)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow1)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow1)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <ellipse cx="100" cy="70" rx="15" ry="12" fill="#00CCFF" opacity="0.6" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <text x="100" y="105" fontFamily="Orbitron, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>
                  <g transform="translate(350, 120)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="80" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="250" y="0" fontFamily="Orbitron, sans-serif" fontSize="80" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="230" fontFamily="Orbitron, sans-serif" fontSize="36" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade Smarter, Not Harder</text>
                  <text x="600" y="280" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="500" fill="#00FF80" textAnchor="middle">Start Your Crypto Journey Today</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 3 - Trusted Platform */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 3 - Trusted Platform</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-3', 'fluxtrade-banner-3.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-3" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="#0A0A0A" />
                  <g transform="translate(400, 100)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="68" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="200" y="0" fontFamily="Orbitron, sans-serif" fontSize="68" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="200" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Your Trusted Crypto Partner</text>
                  <g transform="translate(250, 240)">
                    <text x="0" y="0" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="500" fill="#00FF80">🔒 Bank-Grade Security</text>
                    <text x="300" y="0" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="500" fill="#00FF80">📈 Live Market Data</text>
                    <text x="600" y="0" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="500" fill="#00FF80">💰 High ROI Plans</text>
                  </g>
                  <g transform="translate(100, 120)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                  </g>
                  <g transform="translate(1000, 120)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 4 - Investment Excellence */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 4 - Investment Excellence</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-4', 'fluxtrade-banner-4.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-4" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="url(#bgGrad1)" />
                  <g transform="translate(480, 80)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="64" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="190" y="0" fontFamily="Orbitron, sans-serif" fontSize="64" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="170" fontFamily="Orbitron, sans-serif" fontSize="42" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow1)">Excellence in Crypto Investment</text>
                  <text x="600" y="230" fontFamily="Inter, sans-serif" fontSize="26" fontWeight="500" fill="#FFFFFF" textAnchor="middle">Professional Trading • Secure Wallets • 24/7 Support</text>
                  <rect x="400" y="270" width="400" height="60" rx="30" fill="#1A1A1A" stroke="#00FF80" strokeWidth="3" />
                  <text x="600" y="310" fontFamily="Orbitron, sans-serif" fontSize="24" fontWeight="700" fill="#00FF80" textAnchor="middle">GET STARTED NOW</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 5 - BTC, ETH & More */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 5 - Multi-Coin Trading</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-5', 'fluxtrade-banner-5.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-5" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="#0A0A0A" />
                  <g transform="translate(400, 100)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="70" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="210" y="0" fontFamily="Orbitron, sans-serif" fontSize="70" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="210" fontFamily="Orbitron, sans-serif" fontSize="38" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade BTC, ETH, BNB & More</text>
                  <g transform="translate(200, 260)">
                    <circle cx="80" cy="30" r="35" fill="#1A1A1A" stroke="#00FF80" strokeWidth="3" />
                    <text x="80" y="40" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700" fill="#00FF80" textAnchor="middle">₿</text>
                    <circle cx="280" cy="30" r="35" fill="#1A1A1A" stroke="#00CCFF" strokeWidth="3" />
                    <text x="280" y="40" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700" fill="#00CCFF" textAnchor="middle">Ξ</text>
                    <circle cx="480" cy="30" r="35" fill="#1A1A1A" stroke="#00FF80" strokeWidth="3" />
                    <text x="480" y="38" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="#00FF80" textAnchor="middle">BNB</text>
                    <circle cx="680" cy="30" r="35" fill="#1A1A1A" stroke="#00CCFF" strokeWidth="3" />
                    <text x="680" y="38" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#00CCFF" textAnchor="middle">+6</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 6 - 24/7 Trading */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 6 - 24/7 Trading</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-6', 'fluxtrade-banner-6.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-6" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="url(#bgGrad1)" />
                  <circle cx="250" cy="200" r="160" fill="url(#circleGlow1)" />
                  <g transform="translate(170, 110)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow1)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow1)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <text x="100" y="105" fontFamily="Orbitron, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>
                  <g transform="translate(500, 100)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="220" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="750" y="220" fontFamily="Orbitron, sans-serif" fontSize="48" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow1)">24/7</text>
                  <text x="750" y="270" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Non-Stop Crypto Trading</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 7 - Maximize Profits */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 7 - Maximize Profits</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-7', 'fluxtrade-banner-7.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-7" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="#0A0A0A" />
                  <g transform="translate(350, 80)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="76" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="230" y="0" fontFamily="Orbitron, sans-serif" fontSize="76" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="190" fontFamily="Orbitron, sans-serif" fontSize="40" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Maximize Your Crypto Profits</text>
                  <text x="600" y="250" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="600" fill="#00FF80" textAnchor="middle">Advanced Trading Tools & Analytics</text>
                  <g transform="translate(350, 290)">
                    <text x="0" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00CCFF">✓ Smart Algorithms</text>
                    <text x="280" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00CCFF">✓ Expert Support</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 8 - Secure & Simple */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 8 - Secure & Simple</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-8', 'fluxtrade-banner-8.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-8" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="url(#bgGrad1)" />
                  <g transform="translate(420, 110)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="66" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="200" y="0" fontFamily="Orbitron, sans-serif" fontSize="66" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="210" fontFamily="Orbitron, sans-serif" fontSize="44" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow1)">Secure • Simple • Profitable</text>
                  <text x="600" y="270" fontFamily="Inter, sans-serif" fontSize="26" fontWeight="500" fill="#FFFFFF" textAnchor="middle">Your Gateway to Crypto Success</text>
                  <g transform="translate(90, 100)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                  </g>
                  <g transform="translate(1010, 100)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 9 - Start Today */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 9 - Start Today</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-9', 'fluxtrade-banner-9.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-9" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="#0A0A0A" />
                  <circle cx="180" cy="200" r="170" fill="url(#circleGlow1)" />
                  <circle cx="1020" cy="200" r="170" fill="url(#circleGlow1)" />
                  <g transform="translate(100, 110)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad1)" filter="url(#glow1)" stroke="#00FF80" strokeWidth="2" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow1)" />
                    <text x="100" y="105" fontFamily="Orbitron, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>
                  <g transform="translate(380, 100)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="74" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="225" y="0" fontFamily="Orbitron, sans-serif" fontSize="74" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="230" fontFamily="Orbitron, sans-serif" fontSize="42" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Start Trading Today</text>
                  <text x="600" y="290" fontFamily="Inter, sans-serif" fontSize="26" fontWeight="600" fill="#00FF80" textAnchor="middle">Join Thousands of Successful Traders</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Banner 10 - Future of Finance */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Banner 10 - Future of Finance</CardTitle>
                <Button
                  onClick={() => downloadSVG('banner-10', 'fluxtrade-banner-10.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="banner-10" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1200" height="400" fill="url(#bgGrad1)" />
                  <g transform="translate(360, 90)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="url(#fluxGrad1)" filter="url(#glow1)">Flux</text>
                    <text x="220" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>
                  <text x="600" y="200" fontFamily="Orbitron, sans-serif" fontSize="38" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow1)">The Future of Finance</text>
                  <text x="600" y="250" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Trade • Invest • Grow Your Wealth</text>
                  <rect x="350" y="280" width="500" height="70" rx="35" fill="#1A1A1A" stroke="#00FF80" strokeWidth="4" />
                  <text x="600" y="328" fontFamily="Orbitron, sans-serif" fontSize="26" fontWeight="700" fill="#00FF80" textAnchor="middle">SIGN UP FREE</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* POSTERS */}
          <h2 className="text-3xl font-bold text-white mb-6 mt-12">Posters (800x800)</h2>

          {/* Poster 1 - Join Happy Investors */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Poster 1 - Happy Investors</CardTitle>
                <Button
                  onClick={() => downloadSVG('poster-1', 'fluxtrade-poster-1.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="poster-1" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0A0A0A" />
                      <stop offset="50%" stopColor="#1A1A1A" />
                      <stop offset="100%" stopColor="#0A0A0A" />
                    </linearGradient>
                    <linearGradient id="fluxGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00FF80" />
                      <stop offset="100%" stopColor="#00CCFF" />
                    </linearGradient>
                    <filter id="glow2">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="circleGlow2" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00FF80" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#00FF80" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="800" height="800" fill="url(#bgGrad2)" />
                  <circle cx="400" cy="250" r="250" fill="url(#circleGlow2)" />
                  <circle cx="400" cy="650" r="200" fill="url(#circleGlow2)" />
                  <g transform="translate(300, 80) scale(1.2)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad2)" filter="url(#glow2)" stroke="#00FF80" strokeWidth="3" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow2)" stroke="#00CCFF" strokeWidth="2" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow2)" stroke="#00CCFF" strokeWidth="2" opacity="0.8" />
                    <ellipse cx="100" cy="70" rx="18" ry="15" fill="#00CCFF" opacity="0.6" />
                    <circle cx="85" cy="150" r="10" fill="#00FF80" filter="url(#glow2)" />
                    <circle cx="115" cy="150" r="10" fill="#00FF80" filter="url(#glow2)" />
                    <text x="100" y="108" fontFamily="Orbitron, sans-serif" fontSize="18" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>
                  <g transform="translate(400, 360)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="90" fontWeight="700" fill="url(#fluxGrad2)" filter="url(#glow2)" textAnchor="middle">Flux</text>
                    <text x="0" y="80" fontFamily="Orbitron, sans-serif" fontSize="90" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>
                  <g transform="translate(400, 520)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="42" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow2)">10,000+</text>
                    <text x="0" y="50" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">Happy Investors</text>
                  </g>
                  <g transform="translate(100, 640)">
                    <rect x="0" y="0" width="600" height="60" rx="10" fill="#1A1A1A" stroke="#00FF80" strokeWidth="2" />
                    <text x="80" y="38" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#00FF80">✓ Bitcoin</text>
                    <text x="240" y="38" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#00FF80">✓ Ethereum</text>
                    <text x="420" y="38" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#00FF80">✓ Multi-Coin</text>
                  </g>
                  <text x="400" y="750" fontFamily="Orbitron, sans-serif" fontSize="24" fontWeight="700" fill="#FFFFFF" textAnchor="middle" opacity="0.8">Start Trading Today</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Poster 2 - Trade Crypto */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Poster 2 - Trade Crypto</CardTitle>
                <Button
                  onClick={() => downloadSVG('poster-2', 'fluxtrade-poster-2.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="poster-2" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="800" fill="#0A0A0A" />
                  <circle cx="400" cy="300" r="280" fill="url(#circleGlow2)" />
                  <g transform="translate(280, 100) scale(1.3)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad2)" filter="url(#glow2)" stroke="#00FF80" strokeWidth="3" />
                    <circle cx="85" cy="150" r="10" fill="#00FF80" filter="url(#glow2)" />
                    <circle cx="115" cy="150" r="10" fill="#00FF80" filter="url(#glow2)" />
                  </g>
                  <g transform="translate(400, 400)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="86" fontWeight="700" fill="url(#fluxGrad2)" filter="url(#glow2)" textAnchor="middle">Flux</text>
                    <text x="0" y="75" fontFamily="Orbitron, sans-serif" fontSize="86" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>
                  <text x="400" y="560" fontFamily="Orbitron, sans-serif" fontSize="46" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow2)">Trade Crypto</text>
                  <text x="400" y="620" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Like a Pro</text>
                  <rect x="200" y="670" width="400" height="80" rx="40" fill="#1A1A1A" stroke="#00FF80" strokeWidth="4" />
                  <text x="400" y="720" fontFamily="Orbitron, sans-serif" fontSize="28" fontWeight="700" fill="#00FF80" textAnchor="middle">GET STARTED</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Poster 3 - Secure Wallets */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Poster 3 - Secure Wallets</CardTitle>
                <Button
                  onClick={() => downloadSVG('poster-3', 'fluxtrade-poster-3.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="poster-3" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="800" fill="url(#bgGrad2)" />
                  <g transform="translate(400, 180)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="92" fontWeight="700" fill="url(#fluxGrad2)" filter="url(#glow2)" textAnchor="middle">Flux</text>
                    <text x="0" y="82" fontFamily="Orbitron, sans-serif" fontSize="92" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>
                  <text x="400" y="380" fontFamily="Orbitron, sans-serif" fontSize="40" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Secure Crypto Wallets</text>
                  <text x="400" y="440" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="600" fill="#00FF80" textAnchor="middle">Your Keys, Your Crypto</text>
                  <g transform="translate(150, 500)">
                    <rect x="0" y="0" width="500" height="60" rx="10" fill="#1A1A1A" stroke="#00FF80" strokeWidth="3" />
                    <text x="250" y="40" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="600" fill="#00FF80" textAnchor="middle">🔒 Bank-Grade Security</text>
                  </g>
                  <g transform="translate(150, 580)">
                    <rect x="0" y="0" width="500" height="60" rx="10" fill="#1A1A1A" stroke="#00CCFF" strokeWidth="3" />
                    <text x="250" y="40" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="600" fill="#00CCFF" textAnchor="middle">💼 Multi-Currency Support</text>
                  </g>
                  <g transform="translate(150, 660)">
                    <rect x="0" y="0" width="500" height="60" rx="10" fill="#1A1A1A" stroke="#00FF80" strokeWidth="3" />
                    <text x="250" y="40" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="600" fill="#00FF80" textAnchor="middle">⚡ Instant Transactions</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Poster 4 - Investment Plans */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Poster 4 - Investment Plans</CardTitle>
                <Button
                  onClick={() => downloadSVG('poster-4', 'fluxtrade-poster-4.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="poster-4" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="800" fill="#0A0A0A" />
                  <circle cx="400" cy="200" r="220" fill="url(#circleGlow2)" />
                  <g transform="translate(400, 140)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="88" fontWeight="700" fill="url(#fluxGrad2)" filter="url(#glow2)" textAnchor="middle">Flux</text>
                    <text x="0" y="78" fontFamily="Orbitron, sans-serif" fontSize="88" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>
                  <text x="400" y="340" fontFamily="Orbitron, sans-serif" fontSize="44" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow2)">Premium Plans</text>
                  <text x="400" y="400" fontFamily="Inter, sans-serif" fontSize="30" fontWeight="600" fill="#FFFFFF" textAnchor="middle">High ROI Investment Options</text>
                  <g transform="translate(125, 460)">
                    <circle cx="100" cy="50" r="70" fill="#1A1A1A" stroke="#00FF80" strokeWidth="4" />
                    <text x="100" y="55" fontFamily="Orbitron, sans-serif" fontSize="32" fontWeight="700" fill="#00FF80" textAnchor="middle">25%</text>
                    <text x="100" y="85" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Starter</text>
                    <circle cx="275" cy="50" r="70" fill="#1A1A1A" stroke="#00CCFF" strokeWidth="4" />
                    <text x="275" y="55" fontFamily="Orbitron, sans-serif" fontSize="32" fontWeight="700" fill="#00CCFF" textAnchor="middle">50%</text>
                    <text x="275" y="85" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Pro</text>
                    <circle cx="450" cy="50" r="70" fill="#1A1A1A" stroke="#00FF80" strokeWidth="4" />
                    <text x="450" y="55" fontFamily="Orbitron, sans-serif" fontSize="32" fontWeight="700" fill="#00FF80" textAnchor="middle">100%</text>
                    <text x="450" y="85" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Elite</text>
                  </g>
                  <text x="400" y="650" fontFamily="Inter, sans-serif" fontSize="26" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Choose Your Path to Profit</text>
                  <rect x="200" y="690" width="400" height="70" rx="35" fill="#1A1A1A" stroke="#00FF80" strokeWidth="4" />
                  <text x="400" y="738" fontFamily="Orbitron, sans-serif" fontSize="26" fontWeight="700" fill="#00FF80" textAnchor="middle">INVEST NOW</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Poster 5 - Join Community */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Poster 5 - Join Community</CardTitle>
                <Button
                  onClick={() => downloadSVG('poster-5', 'fluxtrade-poster-5.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="poster-5" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="800" fill="url(#bgGrad2)" />
                  <circle cx="400" cy="400" r="300" fill="url(#circleGlow2)" />
                  <g transform="translate(240, 120) scale(1.5)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad2)" filter="url(#glow2)" stroke="#00FF80" strokeWidth="3" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow2)" stroke="#00CCFF" strokeWidth="2" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow2)" stroke="#00CCFF" strokeWidth="2" opacity="0.8" />
                    <text x="100" y="108" fontFamily="Orbitron, sans-serif" fontSize="18" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>
                  <g transform="translate(400, 400)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="94" fontWeight="700" fill="url(#fluxGrad2)" filter="url(#glow2)" textAnchor="middle">Flux</text>
                    <text x="0" y="84" fontFamily="Orbitron, sans-serif" fontSize="94" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>
                  <text x="400" y="580" fontFamily="Orbitron, sans-serif" fontSize="46" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow2)">Join Our Community</text>
                  <text x="400" y="640" fontFamily="Inter, sans-serif" fontSize="30" fontWeight="600" fill="#FFFFFF" textAnchor="middle">10,000+ Traders Worldwide</text>
                  <text x="400" y="720" fontFamily="Orbitron, sans-serif" fontSize="28" fontWeight="700" fill="#FFFFFF" textAnchor="middle" opacity="0.8">Register Free • Trade Now</text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
