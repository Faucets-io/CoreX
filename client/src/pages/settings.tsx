
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/app-layout";
import { User, Globe, LogOut, Bell, Crown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NeonBackdrop } from "@/components/neon-backdrop";

export default function Settings() {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [notifications, setNotifications] = useState(true);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  };

  if (!user) {
    return <div>Please log in to access settings</div>;
  }

  const menuItems = [
    {
      id: "account",
      label: "Account",
      icon: User,
      description: "Profile and personal information"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Manage your notification settings"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen neon-bg relative">
        <NeonBackdrop />
        
        <div className="relative z-10 pb-24">
          <div className="max-w-sm mx-auto px-6 pt-6">
            {/* Profile Summary Card */}
            <div className="neon-card rounded-2xl p-6 mb-6 border neon-border neon-glow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF80] to-[#00CC66] flex items-center justify-center neon-glow-lg">
                  <User className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold neon-text">{user.email.split('@')[0]}</h3>
                  <p className="text-sm neon-text-secondary mb-2">{user.email}</p>
                  {user.isAdmin ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge className="bg-[#00FF80]/20 text-[#00FF80] border-[#00FF80]/30">
                      Member
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold neon-text mb-1">Settings</h2>
              <p className="text-sm neon-text-secondary">Manage your account preferences</p>
            </div>

            {/* Navigation Menu */}
            <div className="space-y-3 mb-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div
                    key={item.id}
                    className={`cursor-pointer transition-all duration-200 neon-card rounded-2xl border ${
                      isActive
                        ? 'neon-border bg-[#00FF80]/10 neon-glow'
                        : 'border-[#00FF80]/20 hover:border-[#00FF80]/40 hover:bg-[#00FF80]/5'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? 'bg-[#00FF80]/25 neon-glow-sm' : 'bg-[#00FF80]/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-[#00FF80]' : 'neon-text-secondary'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold neon-text">{item.label}</h4>
                          <p className="text-xs neon-text-secondary">{item.description}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          isActive ? 'text-[#00FF80] rotate-90' : 'neon-text-secondary'
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {/* Theme Toggle Section */}
              <div className="neon-card rounded-2xl border neon-border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold neon-text mb-4">Appearance</h3>
                  <ThemeToggle />
                </div>
              </div>

              {activeTab === "account" && (
                <div className="neon-card rounded-2xl border neon-border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold neon-text mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#00FF80]" />
                      </div>
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div>
                          <p className="font-medium neon-text">Email Address</p>
                          <p className="text-sm neon-text-secondary">{user.email}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          Verified
                        </Badge>
                      </div>

                      <Separator className="bg-[#00FF80]/20" />

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-[#00FF80]" />
                          <div>
                            <p className="font-medium neon-text">Currency</p>
                            <p className="text-sm neon-text-secondary">Display preference</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={toggleCurrency}
                          className="rounded-lg bg-[#00FF80]/10 border-[#00FF80]/30 text-[#00FF80] hover:bg-[#00FF80] hover:text-black neon-glow-sm"
                        >
                          {currency}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="neon-card rounded-2xl border neon-border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold neon-text mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00FF80]/20 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-[#00FF80]" />
                      </div>
                      Notification Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div>
                          <p className="font-medium neon-text">Push Notifications</p>
                          <p className="text-sm neon-text-secondary">Receive alerts and updates</p>
                        </div>
                        <Switch
                          checked={notifications}
                          onCheckedChange={setNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div>
                          <p className="font-medium neon-text">Price Alerts</p>
                          <p className="text-sm neon-text-secondary">Bitcoin price changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div>
                          <p className="font-medium neon-text">Investment Updates</p>
                          <p className="text-sm neon-text-secondary">Portfolio performance</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div>
                          <p className="font-medium neon-text">Security Alerts</p>
                          <p className="text-sm neon-text-secondary">Login and security events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#00FF80]/5 border border-[#00FF80]/20">
                        <div>
                          <p className="font-medium neon-text">Marketing</p>
                          <p className="text-sm neon-text-secondary">Product updates and offers</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Section */}
            <div className="mt-8 neon-card rounded-2xl border border-red-500/30 bg-red-500/5">
              <div className="p-6">
                <Button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg transition-all duration-300 group"
                  style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
                >
                  <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
