'use client';

import { useState } from 'react';
import { 
  BoltIcon, 
  InformationCircleIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';
import PaperTradingSimulator from '@/components/trading/PaperTradingSimulator';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

export default function TradingPage() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <BoltIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Paper Trading Simulator
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Practice trading with virtual money - Learn without risk
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowInfo(!showInfo)}
              className="border-border hover:bg-muted hover:text-foreground"
            >
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              How it works
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      {showInfo && (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-foreground font-semibold mb-4">About Paper Trading</CardTitle>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Risk-Free Learning:</strong> Practice trading strategies with virtual money without risking real capital.
                    </p>
                    <p>
                      <strong className="text-foreground">Real Market Simulation:</strong> Experience realistic price movements and trading mechanics.
                    </p>
                    <p>
                      <strong className="text-foreground">Portfolio Tracking:</strong> Monitor your performance, P&L, and trading history.
                    </p>
                    <p>
                      <strong className="text-foreground">No Time Limits:</strong> Trade as much as you want with a starting balance of $100,000.
                    </p>
                  </div>
                  
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-foreground">Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          Real-time price updates every 5 seconds
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          Multiple cryptocurrency pairs available
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          Automatic P&L calculation and position tracking
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          Complete trade history and analytics
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          Buy/sell validation and balance checks
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-yellow-500/10 dark:bg-yellow-400/10 border-yellow-500/30 dark:border-yellow-400/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-yellow-700 dark:text-yellow-400">Disclaimer:</strong> This is a simulation for educational purposes only. 
                      Prices are simulated and do not reflect real market conditions. 
                      Always conduct thorough research and consider your risk tolerance before real trading.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Trading Interface */}
      <PaperTradingSimulator />

      {/* Educational Footer */}
      <Card className="border-border bg-card">
        <CardContent className="text-center pt-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <AcademicCapIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl mb-4 text-foreground font-semibold">
            Ready for Real Trading?
          </CardTitle>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Once you&apos;re comfortable with the paper trading simulator and have developed 
            profitable strategies, you can consider transitioning to real trading. 
            Remember to start small and never invest more than you can afford to lose.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg px-8"
            >
              Learn More About Trading
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-border hover:bg-muted hover:text-foreground font-semibold transition-all duration-200 hover:scale-105 px-8"
            >
              Risk Management Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}