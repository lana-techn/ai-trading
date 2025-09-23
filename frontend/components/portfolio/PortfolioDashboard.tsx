'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Dynamic import for ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PortfolioDashboardProps {
  portfolioData: any;
  showBalance: boolean;
}

export default function PortfolioDashboard({ portfolioData, showBalance }: PortfolioDashboardProps) {
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

  // Portfolio allocation data for pie chart
  const allocationData = {
    series: portfolioData.holdings.map((h: any) => h.value),
    options: {
      chart: {
        type: 'donut' as const,
        height: 380
      },
      labels: portfolioData.holdings.map((h: any) => h.symbol),
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
              },
              value: {
                show: true,
                fontSize: '14px',
                formatter: function (val: any) {
                  return showBalance ? `$${(val).toLocaleString()}` : '••••••';
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Value',
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151',
                formatter: function () {
                  return showBalance ? formatCurrency(portfolioData.totalValue) : '••••••';
                }
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: 'bottom' as const
          }
        }
      }]
    }
  };

  // Performance trend data
  const performanceData = {
    series: [{
      name: 'Portfolio Value',
      data: [95000, 102000, 98000, 115000, 127000, 125000, portfolioData.totalValue]
    }],
    options: {
      chart: {
        type: 'area' as const,
        height: 300,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth' as const,
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
      colors: ['#10B981'],
      xaxis: {
        categories: ['6M', '5M', '4M', '3M', '2M', '1M', 'Now']
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return showBalance ? formatCurrency(val) : '••••••';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
              <div className="text-xs text-muted-foreground">Best Performer</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {portfolioData.holdings.reduce((best: any, current: any) => 
                  current.gainLossPercent > best.gainLossPercent ? current : best
                ).symbol}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                {formatPercentage(Math.max(...portfolioData.holdings.map((h: any) => h.gainLossPercent)))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                <GlobeAltIcon className="h-6 w-6" />
              </div>
              <div className="text-xs text-muted-foreground">Diversification</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {portfolioData.holdings.length} Assets
              </div>
              <div className="text-sm text-muted-foreground">
                Well Diversified
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div className="text-xs text-muted-foreground">Portfolio Score</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                {Math.round(85 + Math.random() * 10)}/100
              </div>
              <div className="text-sm text-muted-foreground">
                Excellent
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ChartPieIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Portfolio Allocation</h3>
            </div>
            <div className="h-80">
              <Chart
                options={allocationData.options}
                series={allocationData.series}
                type="donut"
                height="320"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ArrowTrendingUpIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Performance Trend</h3>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Chart
                options={performanceData.options}
                series={performanceData.series}
                type="area"
                height="300"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BanknotesIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Top Holdings</h3>
          </div>
          <div className="space-y-4">
            {portfolioData.holdings.slice(0, 5).map((holding: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {holding.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{holding.symbol}</div>
                    <div className="text-sm text-muted-foreground">{holding.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    {formatCurrency(holding.value)}
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    holding.gainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {formatPercentage(holding.gainLossPercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}