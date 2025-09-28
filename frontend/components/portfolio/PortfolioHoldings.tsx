'use client';

import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface PortfolioHoldingsProps {
  holdings: Holding[];
  showBalance: boolean;
}

export default function PortfolioHoldings({ holdings, showBalance }: PortfolioHoldingsProps) {
  const formatCurrency = (amount: number) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BanknotesIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Portfolio Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Avg Price</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Current Price</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Value</th>
                <th className="text-right py-3 text-sm font-medium text-muted-foreground">P&L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {holding.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{holding.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 text-foreground">
                    {holding.quantity.toFixed(4)}
                  </td>
                  <td className="text-right py-4 text-foreground">
                    {formatCurrency(holding.avgPrice)}
                  </td>
                  <td className="text-right py-4 text-foreground">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="text-right py-4 font-medium text-foreground">
                    {formatCurrency(holding.value)}
                  </td>
                  <td className="text-right py-4">
                    <div className={cn(
                      "font-medium",
                      holding.gainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatCurrency(holding.gainLoss)}
                    </div>
                    <div className={cn(
                      "text-sm",
                      holding.gainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatPercentage(holding.gainLossPercent)}
                    </div>
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