'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { keyMetrics } from '../data/analyticsData';
import { 
  performanceData, 
  accuracyData, 
  userRetentionData, 
  marketImpactData,
  indonesianDemographicsData,
  cryptoVsTraditionalData
} from '../data/chartConfigs';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} hover className="transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', metric.bgColor)}>
                  <metric.icon className={cn('h-6 w-6', metric.color)} />
                </div>
                <span className={cn('text-sm font-semibold px-2 py-1 rounded-md', metric.bgColor, metric.color)}>
                  {metric.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-xs text-muted-foreground/80">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-500" />
              Research Time Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={performanceData.options}
              series={performanceData.series}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              Decision Accuracy Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={accuracyData.options}
              series={accuracyData.series}
              type="bar"
              height={320}
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-xs text-muted-foreground mb-1">Traditional Methods</div>
                <div className="text-2xl font-bold text-orange-500">78%</div>
                <div className="text-xs text-muted-foreground mt-1">Average Accuracy</div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="text-xs text-muted-foreground mb-1">NousTrade AI</div>
                <div className="text-2xl font-bold text-emerald-500">92%</div>
                <div className="text-xs text-muted-foreground mt-1">Average Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-purple-500" />
              User Retention: NousTrade vs Industry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={userRetentionData.options}
              series={userRetentionData.series}
              type="area"
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-orange-500" />
              Multi-Market Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={marketImpactData.options}
              series={marketImpactData.series}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Indonesian Market Demographics Section */}
      <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-transparent border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-blue-500" />
            Indonesian Market Demographics (KSEI & OJK 2025)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Young investors (15-30 years) dominate Indonesian capital markets with 54.83% market share (~9.7M investors)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Age Distribution Trend (2023-2025)</h4>
              <Chart
                options={indonesianDemographicsData.options}
                series={indonesianDemographicsData.series}
                type="area"
                height={320}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Investors (Aug 2025):</span>
                  <span className="font-semibold text-foreground">18+ Million SID</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Young Investors (15-30):</span>
                  <span className="font-semibold text-blue-500">~9.7 Million (54.83%)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Crypto vs Traditional Market (Young Investors)</h4>
              <Chart
                options={cryptoVsTraditionalData.options}
                series={cryptoVsTraditionalData.series}
                type="donut"
                height={320}
              />
              <div className="mt-4 p-4 bg-background-secondary rounded-xl">
                <h5 className="text-sm font-semibold text-foreground mb-3">Key Insights</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span><span className="font-semibold text-foreground">60%</span> of crypto investors in Indonesia are aged 18-30</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><span className="font-semibold text-foreground">54.33%</span> of traditional market investors are under 30 (KSEI Jul 2025)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>NousTrade targets this <span className="font-semibold text-foreground">dominant demographic</span> with AI-powered education</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <RocketLaunchIcon className="h-6 w-6 text-primary" />
            Platform Development Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background-secondary rounded-xl">
              <div className="text-4xl font-bold text-primary mb-2">10+</div>
              <div className="text-sm text-muted-foreground font-medium">Main Pages Developed</div>
              <div className="text-xs text-muted-foreground mt-1">Chat, Charts, Dashboard, Tutorials, etc.</div>
            </div>
            <div className="text-center p-4 bg-background-secondary rounded-xl">
              <div className="text-4xl font-bold text-emerald-500 mb-2">2</div>
              <div className="text-sm text-muted-foreground font-medium">AI Models Integrated</div>
              <div className="text-xs text-muted-foreground mt-1">Gemini 2.0 Flash & Qwen 2.5 VL</div>
            </div>
            <div className="text-center p-4 bg-background-secondary rounded-xl">
              <div className="text-4xl font-bold text-orange-500 mb-2">30+</div>
              <div className="text-sm text-muted-foreground font-medium">Trading Pairs Supported</div>
              <div className="text-xs text-muted-foreground mt-1">Across Crypto, Forex, Stocks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
