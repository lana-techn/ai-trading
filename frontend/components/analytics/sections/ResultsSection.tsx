'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { 
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { keyMetrics } from '../data/analyticsData';
import { 
  performanceData, 
  accuracyData, 
  userRetentionData, 
  marketImpactData 
} from '../data/chartConfigs';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ResultsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" />
            Key Results & Quantitative Data
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Quantitative data providing concrete evidence of project success, supported by interactive visualizations
          </p>
        </CardHeader>
      </Card>

      {/* Metrics Cards */}
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

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary" />
            Platform Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-500 mb-2">87%</div>
              <div className="text-sm font-medium text-foreground mb-1">Faster Research</div>
              <div className="text-xs text-muted-foreground">vs Traditional Tools</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-500 mb-2">3.2x</div>
              <div className="text-sm font-medium text-foreground mb-1">Decision Accuracy</div>
              <div className="text-xs text-muted-foreground">Multi-market via AI</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-500 mb-2">92%</div>
              <div className="text-sm font-medium text-foreground mb-1">User Retention</div>
              <div className="text-xs text-muted-foreground">Beta testing period</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-500" />
              Weekly Research Time Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={performanceData.options}
              series={performanceData.series}
              type="bar"
              height={320}
            />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              NousTrade reduces research time by <span className="font-semibold text-emerald-500">87% faster</span> compared to traditional tools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              Trading Decision Accuracy Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={accuracyData.options}
              series={accuracyData.series}
              type="bar"
              height={340}
            />
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl border-l-4 border-emerald-500">
              <p className="text-sm text-foreground">
                <span className="font-bold text-emerald-500">92% AI-powered accuracy</span> vs <span className="font-bold text-orange-500">78% traditional</span> - 
                representing a <span className="font-semibold text-emerald-500">3.2x improvement</span> in decision-making precision
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-purple-500" />
              8-Week User Retention: NousTrade vs Industry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={userRetentionData.options}
              series={userRetentionData.series}
              type="area"
              height={320}
            />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Retention rate stable at <span className="font-semibold text-purple-500">92%</span> vs industry average <span className="font-semibold text-red-500">42%</span> - driven by interactive education
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-orange-500" />
              Market Coverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={marketImpactData.options}
              series={marketImpactData.series}
              type="bar"
              height={320}
            />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Platform supports <span className="font-semibold text-orange-500">3 major markets</span> with optimal coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Performance */}
      <Card className="bg-gradient-to-br from-orange-500/5 via-transparent to-transparent border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RocketLaunchIcon className="h-5 w-5 text-orange-500" />
            Technical Performance Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="text-2xl font-bold text-foreground mb-1">2.62 MB</div>
              <div className="text-sm text-muted-foreground">Bundle Size</div>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="text-2xl font-bold text-foreground mb-1">&lt; 200ms</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="text-2xl font-bold text-foreground mb-1">5s - 5min</div>
              <div className="text-sm text-muted-foreground">Adaptive Caching</div>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="text-2xl font-bold text-foreground mb-1">Gzip + Br</div>
              <div className="text-sm text-muted-foreground">Compression</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Impact */}
      <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-transparent border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-blue-500" />
            Educational Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">3x Faster Learning</h4>
                <p className="text-sm text-muted-foreground">
                  Interactive tutorial modules improve trading literacy 3x faster based on beta testing with 150+ users
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">94% Pattern Recognition</h4>
                <p className="text-sm text-muted-foreground">
                  AI can detect chart patterns (ascending triangle, head & shoulders, etc.) with 94% accuracy, supporting faster trading decisions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
