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
      <Card className="bg-gradient-to-r from-primary to-chart-4 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-primary-foreground">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BoltIcon className="h-8 w-8 mr-3" />
                Paper Trading Simulator
              </h1>
              <p className="opacity-90 mt-1">
                Practice trading with virtual money - Learn without risk
              </p>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => setShowInfo(!showInfo)}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              How it works
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      {showInfo && (
        <Card className="bg-gradient-to-br from-info/10 to-primary/10 border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <AcademicCapIcon className="h-8 w-8 text-info flex-shrink-0 mt-1" />
              <div className="flex-1">
                <CardTitle className="text-info mb-4">About Paper Trading</CardTitle>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <p className="text-card-foreground">
                      <strong className="text-info">Risk-Free Learning:</strong> Practice trading strategies with virtual money without risking real capital.
                    </p>
                    <p className="text-card-foreground">
                      <strong className="text-info">Real Market Simulation:</strong> Experience realistic price movements and trading mechanics.
                    </p>
                    <p className="text-card-foreground">
                      <strong className="text-info">Portfolio Tracking:</strong> Monitor your performance, P&L, and trading history.
                    </p>
                    <p className="text-card-foreground">
                      <strong className="text-info">No Time Limits:</strong> Trade as much as you want with a starting balance of $100,000.
                    </p>
                  </div>
                  
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm">Key Features</CardTitle>
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
                
                <Card className="bg-warning/10 border-warning/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-warning">Disclaimer:</strong> This is a simulation for educational purposes only. 
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
      <Card className="bg-gradient-to-br from-success/10 to-info/10 border-success/20">
        <CardContent className="text-center pt-8">
          <AcademicCapIcon className="h-12 w-12 text-success mx-auto mb-6" />
          <CardTitle className="text-xl mb-4 text-success">
            Ready for Real Trading?
          </CardTitle>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Once you&apos;re comfortable with the paper trading simulator and have developed 
            profitable strategies, you can consider transitioning to real trading. 
            Remember to start small and never invest more than you can afford to lose.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="success" size="lg">
              Learn More About Trading
            </Button>
            <Button variant="outline" size="lg" className="border-success text-success hover:bg-success/10">
              Risk Management Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}