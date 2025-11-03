import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, History } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const actions = [
  {
    id: 'invest',
    label: 'Invest',
    icon: TrendingUp,
    path: '/investment',
    color: 'hsl(150 100% 60%)',
    bgColor: 'rgba(0, 255, 128, 0.1)',
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    icon: ArrowUpFromLine,
    path: '/withdraw',
    color: 'hsl(221 83% 53%)',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    path: '/history',
    color: 'hsl(260 60% 65%)',
    bgColor: 'rgba(157, 126, 255, 0.1)',
  },
  {
    id: 'deposit',
    label: 'Deposit',
    icon: ArrowDownToLine,
    path: '/deposit',
    color: 'hsl(141 71% 48%)',
    bgColor: 'rgba(16, 199, 132, 0.1)',
  },
];

export function QuickActionsGrid() {
  const [, setLocation] = useLocation();

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              onClick={() => setLocation(action.path)}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl neon-card border neon-border hover:scale-105 transition-all duration-300"
              style={{
                boxShadow: '0 0 10px rgba(0, 255, 128, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${action.bgColor}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 128, 0.05)';
              }}
              data-testid={`button-action-${action.id}`}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: action.bgColor,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: action.color }} />
              </div>
              <span className="text-sm font-medium neon-text">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
