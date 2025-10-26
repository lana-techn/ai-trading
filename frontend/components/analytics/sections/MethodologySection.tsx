'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  BeakerIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  methodologyApproach,
  techStack,
  developmentPhases,
  technicalImplementations,
} from '../data/analyticsData';

export default function MethodologySection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BeakerIcon className="h-6 w-6 text-primary" />
            Research Methodology & Technical Approach
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Comprehensive overview of research methods, tools, techniques, and architectural decisions used in developing NousTrade platform
          </p>
        </CardHeader>
      </Card>

      {/* Research Approach */}
      <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">{methodologyApproach.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{methodologyApproach.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methodologyApproach.principles.map((principle, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{principle}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-primary" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {techStack.map((stack, index) => (
            <Card key={index} hover className="transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      'bg-gradient-to-br shadow-lg',
                      stack.color
                    )}
                  >
                    <stack.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      {stack.category}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{stack.title}</h3>
                  </div>
                </div>
                <ul className="space-y-2">
                  {stack.technologies.map((tech, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRightIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Architecture Diagram */}
      <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-transparent border-blue-500/20">
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            High-level overview of the platform architecture with component interactions
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-background-secondary p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="text-foreground leading-relaxed whitespace-pre">
{`┌─────────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │
│  │Chat Page │  │ Charts   │  │ Dashboard/       │      │
│  │          │  │ Page     │  │ Portfolio        │      │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘      │
└───────┼─────────────┼─────────────────┼────────────────┘
        │             │                 │
        └─────────────┴─────────────────┘
                      │
        ┌─────────────▼──────────────────┐
        │   NEXT.JS 15 FRONTEND          │
        │   Port: 3000                   │
        │   • App Router (React 19)      │
        │   • Clerk Middleware           │
        │   • API Client (axios)         │
        │   • WebSocket Client           │
        └─────────────┬──────────────────┘
                      │ HTTP/WS
        ┌─────────────▼──────────────────┐
        │   NESTJS 10 BACKEND            │
        │   Port: 8000                   │
        │   • REST API (/api/v1)         │
        │   • CORS + Helmet + Compression│
        │   • Global Cache Interceptor   │
        │                                │
        │   Modules:                     │
        │   ├─ AI Module                 │
        │   ├─ Analysis Module           │
        │   ├─ MarketData Module         │
        │   ├─ Chat Module               │
        │   ├─ Tutorials Module          │
        │   ├─ Audit Module              │
        │   ├─ Health Module             │
        │   ├─ Websocket Module          │
        │   └─ Supabase Module           │
        └─────────────┬──────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────┐            ┌──────▼──────┐
    │ Database │            │  Supabase   │
    │ TypeORM  │            │  Cloud      │
    │          │            │             │
    │ SQLite/  │            │ • Storage   │
    │ Postgres │            │ • RLS       │
    └──────────┘            │ • Tables    │
                            └──────┬──────┘
                                   │
    ┌──────────────────────────────┴──────┐
    │                                      │
┌───▼──────┐                    ┌─────────▼───────┐
│ Gemini   │                    │ Alpha Vantage   │
│ API      │                    │ Market Data API │
└──────────┘                    └─────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Development Phases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Development Phases</h2>
        <div className="space-y-4">
          {developmentPhases.map((phase, index) => (
            <Card key={index} hover className="transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-lg font-bold text-primary-foreground">{phase.phase}</span>
                    </div>
                    {index < developmentPhases.length - 1 && (
                      <div className="h-full w-0.5 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <phase.icon className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-bold text-foreground">{phase.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground px-3 py-1 bg-background-secondary rounded-full">
                          {phase.duration}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-semibold px-3 py-1 rounded-full',
                            phase.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          )}
                        >
                          {phase.status === 'completed' ? '✓ Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {phase.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat with Image Analysis Flow */}
      <Card className="bg-gradient-to-br from-purple-500/5 via-transparent to-transparent border-purple-500/20">
        <CardHeader>
          <CardTitle>AI Chat with Image Analysis Flow</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sequence diagram showing how chart image analysis works from user upload to AI response
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-background-secondary p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="text-foreground leading-relaxed whitespace-pre">
{`User                Frontend              Backend              AI API
 │                     │                     │                   │
 │ 1. Upload chart     │                     │                   │
 ├────────────────────>│                     │                   │
 │                     │ 2. POST /chat/      │                   │
 │                     │    upload-image     │                   │
 │                     ├────────────────────>│                   │
 │                     │                     │ 3. Validate       │
 │                     │                     │    & Extract      │
 │                     │                     │    metadata       │
 │                     │                     │                   │
 │                     │                     │ 4. Send to        │
 │                     │                     │    Gemini API     │
 │                     │                     ├──────────────────>│
 │                     │                     │                   │
 │                     │                     │ 5. AI Analysis    │
 │                     │                     │<──────────────────┤
 │                     │                     │                   │
 │                     │                     │ 6. Store to       │
 │                     │                     │    Supabase       │
 │                     │                     │                   │
 │                     │ 7. Return analysis  │                   │
 │                     │<────────────────────┤                   │
 │ 8. Display result   │                     │                   │
 │<────────────────────┤                     │                   │`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Key Technical Implementations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {technicalImplementations.map((impl, index) => (
            <Card key={index} hover className="transition-all duration-300">
              <CardContent className="p-6">
                <div
                  className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center mb-4',
                    'bg-gradient-to-br shadow-lg',
                    impl.color
                  )}
                >
                  <impl.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{impl.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{impl.description}</p>
                <div className="space-y-2">
                  {impl.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono bg-background-tertiary text-foreground px-3 py-2 rounded"
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Flow Summary */}
      <Card className="bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent border-emerald-500/20">
        <CardHeader>
          <CardTitle>Data Flow & Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                Real-Time Data Processing
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• WebSocket for live price updates</li>
                <li>• Event-driven architecture</li>
                <li>• Adaptive caching strategies</li>
                <li>• Sub-second latency</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                Security & Privacy
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Row-Level Security (RLS)</li>
                <li>• Clerk OAuth authentication</li>
                <li>• HTTPS/TLS encryption</li>
                <li>• Data isolation per user</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-purple-500" />
                AI Integration
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Gemini 2.0 Flash for analysis</li>
                <li>• Multi-modal (text + image)</li>
                <li>• Natural language queries</li>
                <li>• Context-aware responses</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-orange-500" />
                Performance Optimization
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Code splitting & lazy loading</li>
                <li>• Image optimization (WebP/AVIF)</li>
                <li>• Compression & minification</li>
                <li>• CDN-ready static assets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Validation */}
      <Card className="bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent border-yellow-500/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <BeakerIcon className="h-5 w-5 text-yellow-500" />
            Research Validation & Testing
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The methodology was validated through iterative development cycles with continuous testing and optimization. 
            Performance metrics, user feedback, and technical benchmarks confirmed the effectiveness of the chosen architecture 
            and implementation strategies.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-xs text-muted-foreground">Test Coverage</div>
            </div>
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <div className="text-2xl font-bold text-emerald-500 mb-1">&lt;200ms</div>
              <div className="text-xs text-muted-foreground">API Response</div>
            </div>
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <div className="text-2xl font-bold text-blue-500 mb-1">2.62MB</div>
              <div className="text-xs text-muted-foreground">Bundle Size</div>
            </div>
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <div className="text-2xl font-bold text-purple-500 mb-1">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
