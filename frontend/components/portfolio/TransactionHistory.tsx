'use client';

import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/outline';

interface TransactionHistoryProps {
  transactions: any[];
  showBalance: boolean;
}

export default function TransactionHistory({ transactions, showBalance }: TransactionHistoryProps) {
  const formatCurrency = (amount: number) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ClockIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Fees</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 text-sm text-muted-foreground">
                    {transaction.date}
                  </td>
                  <td className="py-4 font-medium text-foreground">{transaction.symbol}</td>
                  <td className="py-4">
                    <Button
                      variant={transaction.type === 'buy' ? 'default' : 'destructive'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      {transaction.type.toUpperCase()}
                    </Button>
                  </td>
                  <td className="text-right py-4 text-foreground">
                    {transaction.quantity.toFixed(4)}
                  </td>
                  <td className="text-right py-4 text-foreground">
                    {formatCurrency(transaction.price)}
                  </td>
                  <td className="text-right py-4 font-medium text-foreground">
                    {formatCurrency(transaction.value)}
                  </td>
                  <td className="text-right py-4 text-muted-foreground">
                    {formatCurrency(transaction.fees)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}