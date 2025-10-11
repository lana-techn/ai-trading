// @ts-nocheck
/**
 * Tutorial Detail Page
 * Shows individual tutorial with sections and navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  User, 
  Tag,
  Eye,
  ChevronRight,
  ChevronDown,
  Share2,
  Download,
  TrendingUp
} from 'lucide-react';
import tutorialAPI from '@/lib/api/tutorials';
import TutorialCard from '@/components/tutorials/TutorialCard';
import TiptapReader from '@/components/tutorials/TiptapReader';
import ReadingProgress from '@/components/tutorials/ReadingProgress';

export default function TutorialDetailPage() {
  const params = useParams();
  const slug = (params as any).slug as string;
  
  const [tutorial, setTutorial] = useState<any>(null);
  const [relatedTutorials, setRelatedTutorials] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadTutorial = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tutorialData, analyticsData] = await Promise.all([
          tutorialAPI.getTutorial(slug),
          tutorialAPI.getTutorialAnalytics(slug).catch(() => null)
        ]);

        setTutorial(tutorialData);
        setAnalytics(analyticsData);

        // Load related tutorials
        if (tutorialData) {
          const related = await tutorialAPI.getRelatedTutorials(slug, 3).catch(() => []);
          setRelatedTutorials(related);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load tutorial');
        console.error('Error loading tutorial:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTutorial();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(index);
    }
  };

  const shareUrl = () => {
    if (navigator.share && tutorial) {
      navigator.share({
        title: tutorial.title,
        text: tutorial.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-6"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-xl mb-4">⚠️ Tutorial Not Found</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link 
            href="/tutorials" 
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return null;
  }

  const sections = tutorial.sections || [];
  const tags = tutorial.tags || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/tutorials" className="hover:text-foreground flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Tutorials
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground truncate">{tutorial.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-chart-1/10 text-chart-1 border border-chart-1/20">
                  {tutorial.category}
                </span>
                <button
                  onClick={shareUrl}
                  className="flex items-center px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="font-medium">Share</span>
                </button>
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-foreground mb-6">
                {tutorial.title}
              </h1>

              <p className="text-xl leading-relaxed text-muted-foreground mb-8">
                {tutorial.description}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-chart-3" />
                  <span className="font-medium">{tutorial.author || 'NousTrade'}</span>
                </div>
                {tutorial.estimated_read_time && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-chart-4" />
                    <span className="font-medium">{tutorial.estimated_read_time} min read</span>
                  </div>
                )}
                {sections.length > 0 && (
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-chart-2" />
                    <span className="font-medium">{sections.length} sections</span>
                  </div>
                )}
                {analytics && analytics.view_count > 0 && (
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-chart-5" />
                    <span className="font-medium">{analytics.view_count} views</span>
                  </div>
                )}
                <div className="text-muted-foreground/80 font-medium">
                  {formatDate(tutorial.created_at)}
                </div>
              </div>

              {/* Difficulty and Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border capitalize ${
                  tutorial.difficulty_level === 'beginner' ? 'bg-success/10 text-success border-success/20' :
                  tutorial.difficulty_level === 'intermediate' ? 'bg-warning/10 text-warning border-warning/20' :
                  'bg-destructive/10 text-destructive border-destructive/20'
                }`}>
                  {tutorial.difficulty_level}
                </span>
                
                {tags.slice(0, 4).map((tag: any, index: number) => (
                  <span 
                    key={`${tag.id}-${index}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm"
                    style={{ 
                      backgroundColor: tag.color + '15', 
                      color: tag.color,
                      border: `1px solid ${tag.color}30`
                    }}
                  >
                    <Tag className="w-3 h-3 mr-1.5" />
                    <span>{tag.name}</span>
                  </span>
                ))}
              </div>
            </header>

            {/* Table of Contents (Mobile) */}
            {sections.length > 0 && (
              <div className="lg:hidden mb-10">
                <button
                  onClick={() => setShowTableOfContents(!showTableOfContents)}
                  className="flex items-center justify-between w-full bg-card border border-card-border rounded-xl p-5 hover:shadow-md transition-all duration-200"
                >
                  <span className="font-bold text-card-foreground">Table of Contents</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transform transition-transform duration-200 ${showTableOfContents ? 'rotate-180' : ''}`} />
                </button>
                
                {showTableOfContents && (
                  <div className="mt-3 bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
                    {sections.map((section: any, index: number) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          scrollToSection(index);
                          setShowTableOfContents(false);
                        }}
                        className={`w-full text-left px-5 py-4 font-medium transition-all duration-200 hover:bg-muted/50 ${
                          index === activeSection ? 'text-chart-1 bg-chart-1/10 border-r-2 border-chart-1' : 'text-card-foreground hover:text-chart-1'
                        } ${index !== sections.length - 1 ? 'border-b border-border/50' : ''}`}
                      >
                        <span className="block leading-relaxed">{section.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="space-y-8">
              {sections.length > 0 ? (
                sections.map((section: any, index: number) => (
                  <div
                    key={section.id}
                    id={`section-${index}`}
                    className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-chart-1/5 to-chart-2/5 px-8 py-6 border-b border-border/60">
                      <h2 className="text-2xl lg:text-3xl font-bold leading-tight text-card-foreground flex items-center">
                        <div className="p-2 bg-chart-1/20 rounded-lg mr-4">
                          <BookOpen className="w-6 h-6 text-chart-1" />
                        </div>
                        {section.title}
                      </h2>
                    </div>
                    
                    <div className="p-8 lg:p-10">
                      <TiptapReader 
                        content={section.content} 
                        title={section.title}
                        sectionIndex={index}
                        totalSections={sections.length}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-xl border border-card-border p-12 text-center text-muted-foreground shadow-sm">
                  <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-50 text-muted-foreground" />
                  <p className="text-lg font-medium">No sections available for this tutorial.</p>
                </div>
              )}
            </div>

            {/* Related Tutorials */}
            {relatedTutorials.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center mb-8">
                  <div className="p-2 bg-chart-2/10 rounded-lg mr-3">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                    Related Tutorials
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedTutorials.map((relatedTutorial: any) => (
                    <TutorialCard 
                      key={relatedTutorial.id} 
                      tutorial={relatedTutorial}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Reading Progress (Desktop) */}
              {sections.length > 0 && (
                <div className="hidden lg:block">
                  <ReadingProgress 
                    sections={sections} 
                    estimatedReadTime={tutorial.estimated_read_time}
                  />
                </div>
              )}

              {/* Tutorial Stats */}
              <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-card-foreground mb-5 flex items-center">
                  <div className="p-1.5 bg-chart-4/10 rounded-lg mr-3">
                    <Eye className="w-4 h-4 text-chart-4" />
                  </div>
                  Tutorial Stats
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Difficulty:</span>
                    <span className={`font-semibold px-2 py-1 rounded-md text-xs capitalize ${
                      tutorial.difficulty_level === 'beginner' ? 'bg-success/10 text-success' :
                      tutorial.difficulty_level === 'intermediate' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>{tutorial.difficulty_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Reading Time:</span>
                    <span className="font-semibold text-card-foreground">{tutorial.estimated_read_time || 'N/A'} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Sections:</span>
                    <span className="font-semibold text-card-foreground">{sections.length}</span>
                  </div>
                  {analytics && analytics.view_count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Views:</span>
                      <span className="font-semibold text-card-foreground">{analytics.view_count}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-card-foreground mb-5 flex items-center">
                  <div className="p-1.5 bg-chart-3/10 rounded-lg mr-3">
                    <ArrowLeft className="w-4 h-4 text-chart-3" />
                  </div>
                  Navigation
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/tutorials"
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-3 text-chart-3 group-hover:text-chart-3" />
                    <span>All Tutorials</span>
                  </Link>
                  <Link
                    href={`/tutorials?category=${encodeURIComponent(tutorial.category)}`}
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 group"
                  >
                    <ChevronRight className="w-4 h-4 mr-3 text-chart-3 group-hover:text-chart-3" />
                    <span>More in {tutorial.category}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
