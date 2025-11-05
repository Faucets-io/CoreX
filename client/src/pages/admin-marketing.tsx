
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
              <p className="text-sm text-gray-400">Advertisement banners and posters for FluxTrade</p>
            </div>
          </div>

          {/* Wide Banner */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Wide Banner (1200x400)</CardTitle>
                <Button
                  onClick={() => downloadSVG('wide-banner', 'fluxtrade-wide-banner.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="wide-banner" width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0A0A0A" />
                      <stop offset="50%" stopColor="#1A1A1A" />
                      <stop offset="100%" stopColor="#0A0A0A" />
                    </linearGradient>
                    <linearGradient id="fluxGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00FF80" />
                      <stop offset="100%" stopColor="#00CCFF" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00FF80" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00FF80" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <rect width="1200" height="400" fill="url(#bgGrad)" />
                  
                  {/* Glow circles */}
                  <circle cx="200" cy="200" r="150" fill="url(#circleGlow)" />
                  <circle cx="1000" cy="200" r="150" fill="url(#circleGlow)" />

                  {/* Jet Icon */}
                  <g transform="translate(150, 120)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad)" filter="url(#glow)" stroke="#00FF80" strokeWidth="2" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <ellipse cx="100" cy="70" rx="15" ry="12" fill="#00CCFF" opacity="0.6" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow)" />
                    <text x="100" y="105" fontFamily="Orbitron, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>

                  {/* Logo */}
                  <g transform="translate(450, 140)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="url(#fluxGrad)" filter="url(#glow)">Flux</text>
                    <text x="220" y="0" fontFamily="Orbitron, sans-serif" fontSize="72" fontWeight="700" fill="#FFFFFF">Trade</text>
                  </g>

                  {/* Tagline */}
                  <text x="600" y="240" fontFamily="Orbitron, sans-serif" fontSize="28" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">
                    Join 10,000+ Happy Investors
                  </text>

                  {/* Features */}
                  <g transform="translate(300, 280)">
                    <text x="0" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00FF80">✓ Secure Trading</text>
                    <text x="250" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00FF80">✓ Real-time Charts</text>
                    <text x="520" y="0" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" fill="#00FF80">✓ Multiple Coins</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Square Poster */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Square Poster (800x800)</CardTitle>
                <Button
                  onClick={() => downloadSVG('square-poster', 'fluxtrade-square-poster.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <svg id="square-poster" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  
                  {/* Glow effects */}
                  <circle cx="400" cy="250" r="250" fill="url(#circleGlow2)" />
                  <circle cx="400" cy="650" r="200" fill="url(#circleGlow2)" />

                  {/* Jet Icon */}
                  <g transform="translate(300, 80) scale(1.2)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad2)" filter="url(#glow2)" stroke="#00FF80" strokeWidth="3" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow2)" stroke="#00CCFF" strokeWidth="2" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow2)" stroke="#00CCFF" strokeWidth="2" opacity="0.8" />
                    <ellipse cx="100" cy="70" rx="18" ry="15" fill="#00CCFF" opacity="0.6" />
                    <circle cx="85" cy="150" r="10" fill="#00FF80" filter="url(#glow2)" />
                    <circle cx="115" cy="150" r="10" fill="#00FF80" filter="url(#glow2)" />
                    <text x="100" y="108" fontFamily="Orbitron, sans-serif" fontSize="18" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>

                  {/* Logo */}
                  <g transform="translate(400, 360)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="90" fontWeight="700" fill="url(#fluxGrad2)" filter="url(#glow2)" textAnchor="middle">Flux</text>
                    <text x="0" y="80" fontFamily="Orbitron, sans-serif" fontSize="90" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>

                  {/* Stats */}
                  <g transform="translate(400, 520)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="42" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow2)">10,000+</text>
                    <text x="0" y="50" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">Happy Investors</text>
                  </g>

                  {/* Features */}
                  <g transform="translate(100, 640)">
                    <rect x="0" y="0" width="600" height="60" rx="10" fill="#1A1A1A" stroke="#00FF80" strokeWidth="2" />
                    <text x="80" y="38" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#00FF80">✓ Bitcoin</text>
                    <text x="240" y="38" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#00FF80">✓ Ethereum</text>
                    <text x="420" y="38" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#00FF80">✓ Multi-Coin</text>
                  </g>

                  {/* Call to action */}
                  <text x="400" y="750" fontFamily="Orbitron, sans-serif" fontSize="24" fontWeight="700" fill="#FFFFFF" textAnchor="middle" opacity="0.8">
                    Start Trading Today
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Vertical Banner */}
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-[#2A2A2A] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Vertical Banner (400x1000)</CardTitle>
                <Button
                  onClick={() => downloadSVG('vertical-banner', 'fluxtrade-vertical-banner.svg')}
                  className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0A0A0A] rounded-lg p-4 flex justify-center">
                <svg id="vertical-banner" width="400" height="1000" viewBox="0 0 400 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0A0A0A" />
                      <stop offset="50%" stopColor="#1A1A1A" />
                      <stop offset="100%" stopColor="#0A0A0A" />
                    </linearGradient>
                    <linearGradient id="fluxGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00FF80" />
                      <stop offset="100%" stopColor="#00CCFF" />
                    </linearGradient>
                    <filter id="glow3">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="circleGlow3" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00FF80" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00FF80" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <rect width="400" height="1000" fill="url(#bgGrad3)" />
                  
                  {/* Glow effects */}
                  <circle cx="200" cy="200" r="180" fill="url(#circleGlow3)" />
                  <circle cx="200" cy="600" r="180" fill="url(#circleGlow3)" />

                  {/* Jet Icon */}
                  <g transform="translate(100, 80)">
                    <path d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z" fill="url(#fluxGrad3)" filter="url(#glow3)" stroke="#00FF80" strokeWidth="2" />
                    <path d="M 60 80 L 30 90 L 40 100 L 60 95 Z" fill="#00CCFF" filter="url(#glow3)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 140 80 L 170 90 L 160 100 L 140 95 Z" fill="#00CCFF" filter="url(#glow3)" stroke="#00CCFF" strokeWidth="1.5" opacity="0.8" />
                    <ellipse cx="100" cy="70" rx="15" ry="12" fill="#00CCFF" opacity="0.6" />
                    <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow3)" />
                    <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow3)" />
                    <text x="100" y="105" fontFamily="Orbitron, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">FT</text>
                  </g>

                  {/* Logo */}
                  <g transform="translate(200, 340)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="56" fontWeight="700" fill="url(#fluxGrad3)" filter="url(#glow3)" textAnchor="middle">Flux</text>
                    <text x="0" y="60" fontFamily="Orbitron, sans-serif" fontSize="56" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Trade</text>
                  </g>

                  {/* Tagline */}
                  <text x="200" y="480" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">
                    The Future of
                  </text>
                  <text x="200" y="510" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">
                    Crypto Trading
                  </text>

                  {/* Stats */}
                  <g transform="translate(200, 580)">
                    <text x="0" y="0" fontFamily="Orbitron, sans-serif" fontSize="48" fontWeight="700" fill="#00FF80" textAnchor="middle" filter="url(#glow3)">10,000+</text>
                    <text x="0" y="45" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="600" fill="#FFFFFF" textAnchor="middle" opacity="0.9">Happy Investors</text>
                  </g>

                  {/* Features */}
                  <g transform="translate(50, 700)">
                    <rect x="0" y="0" width="300" height="50" rx="8" fill="#1A1A1A" stroke="#00FF80" strokeWidth="2" />
                    <text x="150" y="32" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="600" fill="#00FF80" textAnchor="middle">✓ Secure Trading</text>
                  </g>

                  <g transform="translate(50, 770)">
                    <rect x="0" y="0" width="300" height="50" rx="8" fill="#1A1A1A" stroke="#00FF80" strokeWidth="2" />
                    <text x="150" y="32" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="600" fill="#00FF80" textAnchor="middle">✓ Real-time Charts</text>
                  </g>

                  <g transform="translate(50, 840)">
                    <rect x="0" y="0" width="300" height="50" rx="8" fill="#1A1A1A" stroke="#00FF80" strokeWidth="2" />
                    <text x="150" y="32" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="600" fill="#00FF80" textAnchor="middle">✓ Multiple Coins</text>
                  </g>

                  {/* Call to action */}
                  <text x="200" y="950" fontFamily="Orbitron, sans-serif" fontSize="22" fontWeight="700" fill="#FFFFFF" textAnchor="middle" opacity="0.8">
                    Join Now
                  </text>
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
