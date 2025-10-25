'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { objectives } from '../data/analyticsData';

export default function ObjectivesSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
            Project Objectives & Progress
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Main project objectives aligned with trader challenges (information overload, analysis complexity, low literacy)
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {objectives.map((objective, index) => (
          <Card key={index} hover className="transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  objective.status === 'completed' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'bg-orange-500/10 text-orange-500'
                )}>
                  <objective.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground">{objective.title}</h3>
                    <span className={cn(
                      'text-xs font-semibold px-3 py-1 rounded-full',
                      objective.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-orange-500/10 text-orange-500'
                    )}>
                      {objective.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{objective.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{objective.progress}%</span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          objective.status === 'completed'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-r from-orange-500 to-orange-400'
                        )}
                        style={{ width: `${objective.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent border-emerald-500/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            Why These Objectives Matter
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Each objective is designed to address specific pain points faced by retail traders: multi-platform complexity, 
            technical analysis difficulties, lack of integrated education, and data security concerns. 
            NousTrade platform unifies these solutions in one coherent and user-friendly ecosystem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
