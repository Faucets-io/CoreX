import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/bottom-navigation";

import { User, Globe, LogOut, ArrowLeft, Bell, HelpCircle, ChevronRight, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Settings() {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [notifications, setNotifications] = useState(true);

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-flux-cyan/10 to-flux-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-flux-blue/10 to-sapphire/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/10">
        <div className="max-w-sm mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-flux-cyan to-flux-purple bg-clip-text text-transparent">Settings</h1>
              <p className="text-sm text-muted-foreground font-medium">Manage your account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm mx-auto px-6 pb-24">
        {/* Profile Summary Card */}
        <Card className="mt-8 mb-10 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-flux-cyan/20 via-flux-purple/15 to-flux-blue/20 backdrop-blur-sm hover:shadow-flux-cyan/30 transition-all">
          <CardContent className="p-7">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-flux-cyan to-flux-purple flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{user.email.split('@')[0]}</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">{user.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  {user.isAdmin ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 rounded-full shadow-lg">
                      <Crown className="w-3 h-3 mr-1" />
                      Manager
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-3 py-1 rounded-full">
                      Member
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Menu */}
        <div className="space-y-4 mb-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all duration-300 border-0 shadow-lg hover:shadow-2xl ${
                  isActive
                    ? 'bg-gradient-to-r from-flux-cyan/20 via-flux-purple/15 to-flux-blue/20 hover:scale-105'
                    : 'bg-card/80 backdrop-blur-sm hover:bg-primary/10 hover:scale-105'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      isActive ? 'bg-gradient-to-br from-primary/30 to-primary/10' : 'bg-muted/50'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{item.label}</h4>
                      <p className="text-sm text-muted-foreground font-medium">{item.description}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      isActive ? 'text-primary rotate-90' : 'text-muted-foreground'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Theme Toggle Section */}
          <ThemeToggle />

          {activeTab === "account" && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Email Address</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      Verified
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Currency</p>
                        <p className="text-sm text-muted-foreground">Display preference</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={toggleCurrency}
                      className="rounded-lg bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                    >
                      {currency}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}



          {activeTab === "notifications" && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-orange-500" />
                  </div>
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Price Alerts</p>
                      <p className="text-sm text-muted-foreground">Bitcoin price changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Investment Updates</p>
                      <p className="text-sm text-muted-foreground">Portfolio performance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">Login and security events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Marketing</p>
                      <p className="text-sm text-muted-foreground">Product updates and offers</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">Need help? Contact our support team</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}