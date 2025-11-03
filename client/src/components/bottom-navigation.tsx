import { Link, useLocation } from "wouter";
import { Home, TrendingUp, History, Settings, Shield, BarChart3, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="neon-card backdrop-blur-xl border-t neon-border rounded-t-3xl mx-4 mb-4" style={{
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        boxShadow: '0 -4px 20px rgba(0, 255, 128, 0.1)'
      }}>
        <div className="flex justify-around py-3 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div 
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'text-emerald' 
                      : 'neon-text-secondary hover:text-emerald'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  style={isActive ? {
                    backgroundColor: 'rgba(0, 255, 128, 0.1)',
                    boxShadow: '0 0 10px rgba(0, 255, 128, 0.2)'
                  } : {}}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}