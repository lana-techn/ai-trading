/**
 * Tutorial Card Component
 * Displays tutorial information in a card format
 */

import Link from 'next/link';
import { Clock, BookOpen, Tag, User, Eye } from 'lucide-react';
import { Tutorial, TutorialAnalytics } from '@/lib/api/tutorials';

const difficultyColors = {
  beginner: 'bg-success/10 text-success border-success/20 dark:bg-success/20 dark:text-success dark:border-success/30',
  intermediate: 'bg-warning/10 text-warning border-warning/20 dark:bg-warning/20 dark:text-warning dark:border-warning/30',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
};

const categoryColors = {
  'Trading Basics': 'bg-chart-1',
  'Technical Analysis': 'bg-chart-5',
  'Trading Strategy': 'bg-chart-3',
  'Risk Management': 'bg-destructive',
  'Resources': 'bg-chart-6'
};

interface TutorialCardProps {
  tutorial: Tutorial & { analytics?: TutorialAnalytics };
  compact?: boolean;
  showAnalytics?: boolean;
}

export default function TutorialCard({ tutorial, compact = false, showAnalytics = false }: TutorialCardProps) {
  const {
    title,
    slug,
    description,
    category,
    difficulty_level,
    estimated_read_time,
    section_count,
    author,
    tags = [],
    created_at
  } = tutorial;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <Link href={`/tutorials/${slug}`} className="block group">
        <div className="bg-card rounded-lg border border-card-border p-4 hover:shadow-lg hover:shadow-card-shadow/10 hover:border-chart-1/30 transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight text-card-foreground group-hover:text-chart-1 line-clamp-2 transition-colors duration-200">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${difficultyColors[difficulty_level]} capitalize`}>
                {difficulty_level}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              {estimated_read_time && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1.5" />
                  <span className="font-medium">{estimated_read_time} min</span>
                </div>
              )}
              {section_count && (
                <div className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1.5" />
                  <span className="font-medium">{section_count} sections</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm text-card-foreground">{category}</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/tutorials/${slug}`} className="block group">
      <article className="bg-card rounded-xl border border-card-border overflow-hidden hover:shadow-xl hover:shadow-card-shadow/10 transition-all duration-300 hover:border-chart-1/30 hover:-translate-y-1">
        {/* Category Badge */}
        <div className="relative h-2 bg-gradient-to-r from-chart-1/10 to-chart-2/10">
          <div className={`absolute top-4 left-4 w-4 h-4 rounded-full ${categoryColors[category] || 'bg-chart-6'} ring-2 ring-card`}></div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${difficultyColors[difficulty_level]} capitalize backdrop-blur-sm`}>
              {difficulty_level}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold leading-tight text-card-foreground group-hover:text-chart-1 transition-colors duration-300 line-clamp-2 mb-3">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={`${tag.id}-${index}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                  style={{ 
                    backgroundColor: tag.color + '15', 
                    color: tag.color,
                    border: `1px solid ${tag.color}30`
                  }}
                >
                  <Tag className="w-3 h-3 mr-1.5" />
                  <span className="font-semibold">{tag.name}</span>
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground px-2.5 py-1 font-medium">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-5">
              {estimated_read_time && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-chart-4" />
                  <span className="font-medium">{estimated_read_time} min read</span>
                </div>
              )}
              {section_count && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5 text-chart-2" />
                  <span className="font-medium">{section_count} sections</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center text-card-foreground mb-1">
                <User className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{author || 'NousTrade'}</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {formatDate(created_at)}
              </div>
            </div>
          </div>

          {/* Category Footer */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${categoryColors[category] || 'bg-chart-6'}`}></div>
                <span className="text-sm font-semibold text-card-foreground">
                  {category}
                </span>
              </div>
              {showAnalytics && tutorial.view_count && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  <span className="font-medium">{tutorial.view_count} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
