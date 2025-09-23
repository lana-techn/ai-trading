'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { 
  BellIcon, 
  ShareIcon, 
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function ChartBottomSections() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      {/* Market Statistics */}
      <Card className="border shadow-md bg-card">
        <CardHeader className="pb-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/50 dark:to-teal-950/50 rounded-t-lg">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="h-4 w-4 text-cyan-600 dark:text-cyan-400">📊</div>
            🌐 Market Statistics
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1">Global market overview</div>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-medium text-foreground">💰 Market Cap</span>
              <span className="font-bold text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">$1.2T</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800">
              <span className="text-xs font-medium text-foreground">📊 24h Volume</span>
              <span className="font-bold text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">$45.6B</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border border-purple-200 dark:border-purple-800">
              <span className="text-xs font-medium text-foreground">⚡ BTC Dominance</span>
              <span className="font-bold text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full">42.3%</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border border-yellow-200 dark:border-yellow-800">
              <span className="text-xs font-medium text-foreground">😨 Fear & Greed</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">72</span>
                <Badge variant="secondary" className="text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-1">Greed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border shadow-md bg-card">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 rounded-t-lg">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="h-4 w-4 text-orange-600 dark:text-orange-400">⚡</div>
            🚀 Quick Actions
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1">Trading shortcuts</div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full justify-start text-xs bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <BellIcon className="h-3 w-3 mr-2" />
            🔔 Set Price Alert
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            <ShareIcon className="h-3 w-3 mr-2" />
            📤 Share Chart
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            <EyeIcon className="h-3 w-3 mr-2" />
            👀 Add to Watchlist
          </Button>
        </CardContent>
      </Card>

      {/* Pro Tip */}
      <Card className="border shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/70 dark:to-purple-950/70">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-full shadow-md">
              <InformationCircleIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-indigo-900 dark:text-indigo-100">💡 Pro Tip</div>
                <div className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs font-bold rounded-full">NEW</div>
              </div>
              <div className="text-xs text-indigo-800 dark:text-indigo-200 mt-2 leading-relaxed font-medium">
                🖱️ Use <span className="font-bold bg-white dark:bg-gray-800 text-indigo-900 dark:text-indigo-100 px-1 rounded">mouse wheel</span> to zoom in/out on the chart. 
                Hold <span className="font-bold bg-white dark:bg-gray-800 text-indigo-900 dark:text-indigo-100 px-1 rounded">Shift + scroll</span> to zoom horizontally.
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 opacity-80">
                ✨ Double-click to reset zoom level
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}