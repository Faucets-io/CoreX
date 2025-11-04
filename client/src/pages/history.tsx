
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useCurrency } from "@/hooks/use-currency";
import { Clock, TrendingUp, TrendingDown, ArrowUpRight, ArrowLeft, DollarSign, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price";
import { formatBitcoin, formatCurrency, calculateInvestmentProgress, formatDate } from "@/lib/utils";
import type { Investment, Transaction, Notification } from "@shared/schema";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/app-layout";

export default function History() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { data: bitcoinPrice } = useBitcoinPrice();
  const [, setLocation] = useLocation();

  const { data: investments, isLoading, refetch } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user', user?.id],
    queryFn: () => fetch(`/api/investments/user/${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const { data: notifications, isLoading: loadingNotifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', user?.id],
    queryFn: () => fetch(`/api/notifications/${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user?.id,
  });

  if (!user) {
    setLocation('/login');
    return null;
  }

  const sortedInvestments = investments?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  return (
    <AppLayout>
      <div className="min-h-screen neon-bg">
        {/* Neon Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00FF80]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00CCFF]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 pb-24">
          <div className="max-w-sm mx-auto px-6 pt-6">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
                className="mb-4 rounded-xl hover:bg-[#1A1A1A] border border-[#2A2A2A]"
              >
                <ArrowLeft className="w-5 h-5 text-[#00FF80]" />
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-2">
                Transaction History
              </h1>
              <p className="text-sm text-gray-400">Track all your activity</p>
            </div>

            {isLoading || loadingNotifications || loadingTransactions ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-4 border-2 border-[#2A2A2A]">
                    <Skeleton className="h-4 w-3/4 mb-2 bg-[#2A2A2A]" />
                    <Skeleton className="h-3 w-1/2 mb-2 bg-[#2A2A2A]" />
                    <Skeleton className="h-3 w-1/4 bg-[#2A2A2A]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Display all transactions */}
                {transactions && transactions.length > 0 && (
                  <div className="space-y-4">
                    {transactions.map((transaction) => {
                      const getTransactionIcon = () => {
                        switch (transaction.type) {
                          case 'deposit':
                            return <ArrowDownRight className="w-5 h-5 text-[#00FF80]" />;
                          case 'withdrawal':
                            return <ArrowUpRight className="w-5 h-5 text-red-500" />;
                          case 'investment':
                            return <TrendingUp className="w-5 h-5 text-[#00CCFF]" />;
                          default:
                            return <Clock className="w-5 h-5 text-gray-500" />;
                        }
                      };

                      const getStatusBadge = () => {
                        switch (transaction.status) {
                          case 'confirmed':
                            return (
                              <Badge className="bg-[#00FF80]/20 text-[#00FF80] border border-[#00FF80]/30 hover:bg-[#00FF80]/30">
                                Confirmed
                              </Badge>
                            );
                          case 'pending':
                            return (
                              <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30">
                                Pending
                              </Badge>
                            );
                          case 'rejected':
                            return (
                              <Badge className="bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30">
                                Rejected
                              </Badge>
                            );
                          default:
                            return <Badge variant="outline">{transaction.status}</Badge>;
                        }
                      };

                      const currencyPrice = currency === 'USD' ? bitcoinPrice?.usd.price : bitcoinPrice?.gbp.price;
                      const fiatValue = currencyPrice ? parseFloat(transaction.amount) * currencyPrice : 0;

                      return (
                        <div
                          key={`transaction-${transaction.id}`}
                          className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-5 border-2 border-[#2A2A2A] hover:border-[#00FF80]/30 transition-all duration-300"
                          style={{
                            boxShadow: "0 0 30px rgba(0, 255, 128, 0.1)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF80]/20 to-[#00CCFF]/20 flex items-center justify-center border border-[#00FF80]/30">
                                {getTransactionIcon()}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-lg">
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </h3>
                                <p className="text-xs text-gray-400">{formatDate(new Date(transaction.createdAt))}</p>
                              </div>
                            </div>
                            {getStatusBadge()}
                          </div>

                          <Separator className="my-3 bg-[#2A2A2A]" />

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Amount</span>
                              <div className="text-right">
                                <div className="font-bold text-white text-lg">
                                  {formatBitcoin(transaction.amount)} BTC
                                </div>
                                {currencyPrice && (
                                  <div className="text-xs text-gray-400">
                                    {formatCurrency(fiatValue, currency)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {transaction.type === 'withdrawal' && transaction.transactionHash && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Address</span>
                                <span className="text-xs text-[#00FF80] font-mono">
                                  {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-8)}
                                </span>
                              </div>
                            )}

                            {transaction.transactionHash && transaction.type !== 'withdrawal' && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Transaction Hash</span>
                                <span className="text-xs text-[#00FF80] font-mono">
                                  {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-8)}
                                </span>
                              </div>
                            )}

                            {transaction.status === 'rejected' && transaction.notes && (
                              <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/30 mt-2">
                                <div className="text-sm text-red-400">
                                  <span className="font-medium">Reason: </span>
                                  {transaction.notes}
                                </div>
                              </div>
                            )}

                            {transaction.status === 'pending' && (
                              <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/30 mt-2">
                                <div className="text-sm text-yellow-400">
                                  Transaction is pending admin approval
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bitcoin Transactions from Notifications */}
                {notifications && notifications
                  .filter(notif => notif.title.includes("Bitcoin Received") || notif.title.includes("Bitcoin Sent"))
                  .map((notification) => {
                    const isReceived = notification.title.includes("Bitcoin Received");
                    const message = notification.message;

                    const amountMatch = message.match(/(\d+\.?\d*) BTC/);
                    const amount = amountMatch ? amountMatch[1] : "0";

                    const txMatch = message.match(/Transaction ID: ([a-zA-Z0-9]+)/);
                    const txId = txMatch ? txMatch[1] : "";

                    const currencyPrice = currency === 'USD' ? bitcoinPrice?.usd.price : bitcoinPrice?.gbp.price;
                    const fiatValue = currencyPrice ? parseFloat(amount) * currencyPrice : 0;

                    return (
                      <div
                        key={`notif-${notification.id}`}
                        className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-5 border-2 border-[#2A2A2A] hover:border-[#00FF80]/30 transition-all duration-300"
                        style={{
                          boxShadow: "0 0 30px rgba(0, 255, 128, 0.1)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              isReceived 
                                ? 'bg-[#00FF80]/20 border-[#00FF80]/30' 
                                : 'bg-red-500/20 border-red-500/30'
                            }`}>
                              {isReceived ? (
                                <ArrowDownRight className="w-5 h-5 text-[#00FF80]" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg">
                                {isReceived ? "Bitcoin Received" : "Bitcoin Sent"}
                              </h3>
                              <p className="text-xs text-gray-400">{formatDate(new Date(notification.createdAt))}</p>
                            </div>
                          </div>
                          <Badge className={`${
                            isReceived 
                              ? 'bg-[#00FF80]/20 text-[#00FF80] border-[#00FF80]/30' 
                              : 'bg-red-500/20 text-red-500 border-red-500/30'
                          } border`}>
                            {isReceived ? "Received" : "Sent"}
                          </Badge>
                        </div>

                        <Separator className="my-3 bg-[#2A2A2A]" />

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Amount</span>
                            <div className="text-right">
                              <div className={`font-bold text-lg ${isReceived ? "text-[#00FF80]" : "text-red-500"}`}>
                                {isReceived ? "+" : "-"}{formatBitcoin(amount)} BTC
                              </div>
                              {currencyPrice && (
                                <div className="text-xs text-gray-400">
                                  {isReceived ? "+" : "-"}{formatCurrency(fiatValue, currency)}
                                </div>
                              )}
                            </div>
                          </div>

                          {txId && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Transaction ID</span>
                              <span className="text-xs text-[#00FF80] font-mono">{txId}...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Investment History */}
                {sortedInvestments && sortedInvestments.length > 0 ? (
                  <div className="space-y-4">
                    {sortedInvestments.map((investment) => {
                      const progress = calculateInvestmentProgress(new Date(investment.startDate), new Date(investment.endDate));
                      const currentValue = parseFloat(investment.amount) + parseFloat(investment.currentProfit);
                      const currencyPrice = currency === 'USD' ? bitcoinPrice?.usd.price : bitcoinPrice?.gbp.price;
                      const fiatValue = currencyPrice ? currentValue * currencyPrice : 0;

                      return (
                        <div
                          key={investment.id}
                          className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-5 border-2 border-[#2A2A2A] hover:border-[#00CCFF]/30 transition-all duration-300"
                          style={{
                            boxShadow: "0 0 30px rgba(0, 204, 255, 0.1)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00CCFF]/20 to-[#00FF80]/20 flex items-center justify-center border border-[#00CCFF]/30">
                                <TrendingUp className="w-5 h-5 text-[#00CCFF]" />
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-lg">
                                  Investment Plan {investment.planId}
                                </h3>
                                <p className="text-xs text-gray-400">{formatDate(new Date(investment.startDate))}</p>
                              </div>
                            </div>
                            <Badge className={`${
                              investment.isActive 
                                ? 'bg-[#00FF80]/20 text-[#00FF80] border-[#00FF80]/30' 
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            } border`}>
                              {investment.isActive ? "Active" : "Completed"}
                            </Badge>
                          </div>

                          <Separator className="my-3 bg-[#2A2A2A]" />

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Investment</span>
                              <div className="text-right">
                                <div className="font-bold text-white">{formatBitcoin(investment.amount)} BTC</div>
                                {currencyPrice && (
                                  <div className="text-xs text-gray-400">
                                    {formatCurrency(parseFloat(investment.amount) * currencyPrice, currency)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Profit</span>
                              <div className="text-right">
                                <div className="font-bold text-[#00FF80]">+{formatBitcoin(investment.currentProfit)} BTC</div>
                                {currencyPrice && (
                                  <div className="text-xs text-gray-400">
                                    +{formatCurrency(parseFloat(investment.currentProfit) * currencyPrice, currency)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Total Value</span>
                              <div className="text-right">
                                <div className="font-bold text-[#00CCFF]">{formatBitcoin(currentValue)} BTC</div>
                                {currencyPrice && (
                                  <div className="text-xs text-gray-400">
                                    {formatCurrency(fiatValue, currency)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {investment.isActive && (
                              <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Progress</span>
                                  <span className="text-[#00FF80] font-bold">{progress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-2 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.min(progress, 100)}%`,
                                      background: 'linear-gradient(90deg, #00FF80, #00CCFF)'
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Empty state */}
                {(!investments || investments.length === 0) && 
                 (!transactions || transactions.length === 0) &&
                 (!notifications || notifications.filter(n => n.title.includes("Bitcoin")).length === 0) && (
                  <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#2A2A2A] text-center">
                    <TrendingUp className="w-12 h-12 text-[#00FF80]/50 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Transaction History</h3>
                    <p className="text-gray-400 text-sm">
                      You haven't made any transactions or investments yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
