import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { formatDate, formatBitcoin } from "@/lib/utils";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function RecentActivityList() {
  const { user } = useAuth();

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user,
    refetchInterval: 5000,
  });

  if (!user) return null;

  // Get latest 5 transactions
  const recentTransactions = transactions
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) || [];

  if (recentTransactions.length === 0) {
    return null;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownToLine className="w-5 h-5 text-emerald" />;
      case 'withdrawal':
        return <ArrowUpFromLine className="w-5 h-5" style={{ color: 'hsl(221 83% 53%)' }} />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" style={{ color: 'hsl(260 60% 65%)' }} />;
      default:
        return <Clock className="w-5 h-5 neon-text-secondary" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-emerald" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 neon-text-secondary" />;
    }
  };

  const getTransactionDescription = (tx: Transaction) => {
    const amount = formatBitcoin(tx.amount);
    switch (tx.type) {
      case 'deposit':
        return `Deposited ${amount} USDT`;
      case 'withdrawal':
        return `Withdrew ${amount} USDT`;
      case 'investment':
        return `Invested ${amount} USDT in 7D Plan`;
      default:
        return `Transaction ${amount} USDT`;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8 mb-8">
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-xl font-semibold neon-text mb-4"
        data-testid="heading-recent-activity"
      >
        Recent Activity
      </motion.h2>

      <div className="space-y-3">
        {recentTransactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.45 + index * 0.05 }}
            className="flex items-center justify-between p-4 neon-card border neon-border rounded-xl hover:scale-[1.01] transition-all duration-300"
            style={{
              boxShadow: '0 0 10px rgba(0, 255, 128, 0.05)',
            }}
            data-testid={`activity-item-${tx.id}`}
          >
            {/* Left side - Icon and details */}
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: tx.type === 'deposit' 
                    ? 'rgba(16, 199, 132, 0.1)' 
                    : tx.type === 'withdrawal'
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(157, 126, 255, 0.1)'
                }}
              >
                {getTransactionIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium neon-text text-sm truncate" data-testid={`text-description-${tx.id}`}>
                  {getTransactionDescription(tx)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs neon-text-secondary" data-testid={`text-date-${tx.id}`}>
                    {formatDate(new Date(tx.createdAt))}
                  </p>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(tx.status)}
                    <span 
                      className={`text-xs ${
                        tx.status === 'confirmed' 
                          ? 'text-emerald' 
                          : tx.status === 'pending'
                          ? 'text-yellow-500'
                          : 'neon-text-secondary'
                      }`}
                      data-testid={`text-status-${tx.id}`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
