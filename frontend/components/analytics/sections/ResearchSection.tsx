'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { researchQuestions } from '../data/analyticsData';

export default function ResearchSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <LightBulbIcon className="h-6 w-6 text-yellow-500" />
            Research Questions & Findings
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Key research questions that drive the development of NousTrade platform
          </p>
        </CardHeader>
      </Card>

      {researchQuestions.map((research, index) => (
        <Card key={index} hover className="transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className={cn(
                'h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0',
                'bg-gradient-to-br shadow-lg',
                research.color
              )}>
                <research.icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">{research.question}</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Problem:</span>
                    <p className="text-base text-foreground mt-1">{research.problem}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Solution:</span>
                    <p className="text-base text-foreground mt-1">{research.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border-l-4 border-primary">
                    <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{research.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-transparent border-blue-500/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
            Why This Matters
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            These research questions demonstrate a clear focus relevant to modern retail traders' needs. 
            The platform not only addresses information overload and analysis complexity, but also enhances trading literacy 
            through innovative AI-based education.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
