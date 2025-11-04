
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Bitcoin, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatBitcoin, formatDate } from "@/lib/utils";
import type { Transaction } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

export default function Transactions() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Please log in</h2>
          <p className="text-gray-400">You need to be logged in to view transactions.</p>
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Bitcoin className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-[#00FF80]';
      case 'investment':
        return 'text-[#00CCFF]';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-[#00FF80]" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-[#00FF80]/20 text-[#00FF80] border border-[#00FF80]/30 hover:bg-[#00FF80]/30">
            Confirmed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-black" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FF80] rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00CCFF] rounded-full filter blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 pb-24">
        <div className="max-w-sm mx-auto px-6 pt-6">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/history')}
              className="mb-4 rounded-xl hover:bg-[#1A1A1A] border border-[#2A2A2A]"
            >
              <ArrowLeft className="w-5 h-5 text-[#00FF80]" />
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent mb-2">
              Transaction History
            </h1>
            <p className="text-sm text-gray-400">View your deposits and investments</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-32 h-4 bg-[#2A2A2A] rounded"></div>
                    <div className="w-20 h-6 bg-[#2A2A2A] rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-[#2A2A2A] rounded"></div>
                    <div className="w-3/4 h-3 bg-[#2A2A2A] rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions?.length === 0 ? (
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00FF80]/20 to-[#00CCFF]/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-[#00FF80]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Transactions</h3>
              <p className="text-gray-400 mb-6">You haven't made any deposits or investments yet.</p>
              <Button 
                onClick={() => setLocation('/deposit')} 
                className="bg-gradient-to-r from-[#00FF80] to-[#00CCFF] text-black font-bold hover:opacity-90"
              >
                Make a Deposit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border-2 border-[#2A2A2A] hover:border-[#00FF80]/30 transition-all duration-300"
                  style={{
                    boxShadow: "0 0 30px rgba(0, 255, 128, 0.1)",
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF80]/20 to-[#00CCFF]/20 flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg capitalize">
                            {transaction.type}
                          </h3>
                          <p className="text-xs text-gray-400">{formatDate(new Date(transaction.createdAt))}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>

                    <Separator className="my-4 bg-[#2A2A2A]" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Amount</span>
                        <div className="text-right">
                          <div className="font-semibold text-white">{formatBitcoin(transaction.amount)} BTC</div>
                        </div>
                      </div>

                      {transaction.planId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Investment Plan</span>
                          <span className="text-sm text-white">Plan #{transaction.planId}</span>
                        </div>
                      )}

                      {transaction.transactionHash && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-400">Transaction Hash</span>
                          <div className="text-xs font-mono bg-[#0A0A0A]/50 p-3 rounded-lg break-all text-[#00FF80]">
                            {transaction.transactionHash}
                          </div>
                        </div>
                      )}

                      {transaction.status === 'confirmed' && transaction.confirmedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Confirmed</span>
                          <span className="text-sm text-[#00FF80]">{formatDate(new Date(transaction.confirmedAt))}</span>
                        </div>
                      )}

                      {transaction.status === 'rejected' && transaction.notes && (
                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/30 mt-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-red-400 mb-1">Rejection Reason</p>
                              <p className="text-xs text-red-400">{transaction.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {transaction.status === 'pending' && (
                        <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/30">
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-400">
                              Your transaction is pending admin confirmation. You will be notified once it's processed.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
