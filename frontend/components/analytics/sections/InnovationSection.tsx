'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { 
  SparklesIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CpuChipIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { innovations } from '../data/analyticsData';

export default function InnovationSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-primary" />
            Innovative Outcomes & Differentiators
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            NousTrade's unique features as a modern solution in the AI trading era that differentiate from competitor platforms
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {innovations.map((innovation, index) => (
          <Card key={index} hover className="transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  'h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                  'bg-gradient-to-br shadow-lg',
                  innovation.color
                )}>
                  <innovation.icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{innovation.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{innovation.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                    Key Features:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {innovation.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="text-xs font-medium px-3 py-1 bg-background-secondary text-foreground rounded-full border border-border"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border-l-4 border-primary">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{innovation.impact}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Competitive Advantage */}
      <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RocketLaunchIcon className="h-5 w-5 text-primary" />
            Competitive Advantages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background-secondary rounded-xl">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-blue-500" />
                vs Traditional Platforms
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>AI-powered multi-modal analysis vs manual text-based research</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Unified 3-market platform vs separate tools for each market</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Integrated educational system vs external learning resources</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                Security & Performance
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Zero-knowledge security with Supabase RLS policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Optimized bundle size (2.62 MB) with code splitting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Adaptive caching strategy for real-time performance</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Innovations */}
      <Card className="bg-gradient-to-br from-purple-500/5 via-transparent to-transparent border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-purple-500" />
            Future Innovation Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <CpuChipIcon className="h-5 w-5 text-blue-500" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Advanced AI Models</h4>
              <p className="text-sm text-muted-foreground">
                Integration of GPT-4V and Claude for multi-model consensus analysis
              </p>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <GlobeAltIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Global Market Expansion</h4>
              <p className="text-sm text-muted-foreground">
                Support for Asian and European markets with localized analysis
              </p>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <UserGroupIcon className="h-5 w-5 text-purple-500" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Social Trading</h4>
              <p className="text-sm text-muted-foreground">
                Community-driven insights and strategy sharing with AI moderation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
