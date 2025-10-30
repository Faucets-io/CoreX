import { AppNavigation } from "@/components/app-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function AppLayout({ children, maxWidth = "full" }: AppLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      {/* Main content area with proper desktop spacing */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto w-full`}>
          {children}
        </div>
      </main>
    </div>
  );
}
