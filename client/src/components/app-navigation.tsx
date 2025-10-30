import { Link, useLocation } from "wouter";
import { Home, TrendingUp, History, Settings, Shield, BarChart3, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppNavigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Wallet" },
    { path: "/assets", icon: Wallet, label: "Assets" },
    { path: "/trade", icon: BarChart3, label: "Trade" },
    { path: "/investment", icon: TrendingUp, label: "Invest" },
    { path: "/history", icon: History, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  if (user?.isAdmin) {
    navItems.push({ path: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground dark:bg-gradient-to-r dark:from-flux-cyan dark:to-flux-purple dark:bg-clip-text dark:text-transparent">
            FluxTrade
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Professional Trading</p>
        </div>
        
        <Separator className="mb-4" />
        
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="p-4">
          {user && (
            <div className="mb-4 p-3 rounded-xl bg-accent/50">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {user.isAdmin ? 'Administrator' : 'Trader'}
              </p>
            </div>
          )}
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start gap-2"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="flex justify-around py-2 px-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-link-mobile-${item.label.toLowerCase()}`}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
