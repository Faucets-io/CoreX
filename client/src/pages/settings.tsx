import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app-layout";
import { User, Globe, LogOut, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import FluxLogoHeader from "@/components/flux-logo-header";

export default function Settings() {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    toast({
      title: "✓ Signed Out",
      description: "You have been signed out successfully",
    });
  };

  if (!user) {
    return <div>Please log in to access settings</div>;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
        {/* Animated background similar to login */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{ opacity: 0.6 }}>
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 60%) 0%, hsl(150 100% 40%) 50%, transparent 70%)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 50%) 0%, hsl(150 100% 35%) 50%, transparent 70%)',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse-slow"
              style={{
                background: 'radial-gradient(circle, hsl(150 100% 55%) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 pb-24">
          <div className="max-w-sm mx-auto px-6 pt-6">
            {/* Header */}
            <FluxLogoHeader />
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-2">
                Settings
              </h1>
              <p className="text-sm text-gray-400">Manage your account preferences</p>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#00FF80]/30"
              style={{
                boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF80] to-[#00CC66] flex items-center justify-center"
                  style={{ boxShadow: "0 0 25px rgba(0, 255, 128, 0.5)" }}
                >
                  <User className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{user.email.split('@')[0]}</h3>
                  <p className="text-sm text-gray-400 mb-2">{user.email}</p>
                  {user.isAdmin && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-[#00FF80]/30"
              style={{
                boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#00FF80]" />
                </div>
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                  <div>
                    <p className="font-medium text-white">Email Address</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#00FF80]" />
                    <div>
                      <p className="font-medium text-white">Currency</p>
                      <p className="text-sm text-gray-400">Display preference</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleCurrency}
                    className="rounded-lg bg-[#00FF80]/10 border-[#00FF80]/30 text-[#00FF80] hover:bg-[#00FF80] hover:text-black"
                    style={{
                      boxShadow: "0 0 10px rgba(0, 255, 128, 0.2)",
                    }}
                  >
                    {currency}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 mb-8 border-2 border-[#00FF80]/30"
              style={{
                boxShadow: "0 0 40px rgba(0, 255, 128, 0.2), inset 0 0 20px rgba(0, 255, 128, 0.05)",
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#00FF80]" />
                </div>
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                  <div>
                    <p className="font-medium text-white">Push Notifications</p>
                    <p className="text-sm text-gray-400">Receive alerts and updates</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                  <div>
                    <p className="font-medium text-white">Price Alerts</p>
                    <p className="text-sm text-gray-400">Bitcoin price changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                  <div>
                    <p className="font-medium text-white">Security Alerts</p>
                    <p className="text-sm text-gray-400">Login and security events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-red-500/30"
              style={{
                boxShadow: "0 0 40px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.05)",
              }}
            >
              <Button
                onClick={handleLogout}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold transition-all duration-300 group"
                style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
              >
                <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}