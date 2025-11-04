
import FluxTradeProfilePic from "@/components/fluxtrade-profile-pic";
import GlobeBanner from "@/components/globe-banner";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfilePicPreview() {
  const [, setLocation] = useLocation();
  const downloadSVG = () => {
    const svg = document.querySelector('#profile-pic-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fluxtrade-profile-pic.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <Button
          variant="outline"
          onClick={() => setLocation('/admin')}
          className="border-[#00FF80] text-[#00FF80] hover:bg-[#00FF80]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>
      </div>

      {/* Globe Banner */}
      <div className="max-w-6xl mx-auto mb-12">
        <GlobeBanner 
          title="FluxTrade Profile Picture" 
          subtitle="Official Telegram Channel Branding"
        />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col items-center">
      
      <div className="mb-8 bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg">
          <div id="profile-pic-svg">
            <FluxTradeProfilePic size={400} animated={false} />
          </div>
        </div>

      <div className="flex gap-4 mb-8">
          <Button 
            onClick={downloadSVG}
            className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black font-semibold"
          >
            <Download className="mr-2 h-4 w-4" />
            Download SVG
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Small (100x100)</p>
            <div className="bg-gray-900 p-4 rounded-lg inline-block">
              <FluxTradeProfilePic size={100} animated={false} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-4">Medium (200x200)</p>
            <div className="bg-gray-900 p-4 rounded-lg inline-block">
              <FluxTradeProfilePic size={200} animated={false} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-4">Large (400x400)</p>
            <div className="bg-gray-900 p-4 rounded-lg inline-block">
              <FluxTradeProfilePic size={400} animated={false} />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Usage Instructions</h2>
          <p className="text-gray-400">
            This profile picture is optimized for Telegram and other social media platforms.
            Download the SVG file and convert it to PNG (512x512 or 1024x1024) for best results
            on Telegram. The design features your FluxTrade jet icon with the brand name below,
            all on a dark background with neon accents.
          </p>
        </div>
      </div>
    </div>
  );
}
