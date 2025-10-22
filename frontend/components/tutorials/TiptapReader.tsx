// @ts-nocheck
/**
 * Enhanced Tiptap Tutorial Reader
 * Rich, interactive tutorial content display using Tiptap editor
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import { markdownToTiptap, generateInteractiveContent } from '@/lib/markdownToTiptap';
// Removed custom extensions for now - will implement inline

const TiptapReader = ({ content, title, sectionIndex, totalSections }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  // Convert markdown to Tiptap JSON format
  const tiptapContent = useMemo(() => {
    if (!content) return null;
    
    const baseContent = markdownToTiptap(content);
    return baseContent;
  }, [content]);

  // Handle mounting state for SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate reading time
  useEffect(() => {
    if (content) {
      const wordCount = content.split(' ').length;
      const estimatedTime = Math.max(1, Math.round(wordCount / 200)); // 200 words per minute
      setReadingTime(estimatedTime);
    }
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Typography,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: tiptapContent,
    editable: false,
    immediatelyRender: false,
    onTransaction: () => {
      setIsLoaded(true);
    },
  });

  // Show loading state during SSR or before editor is ready
  if (!isMounted || !editor) {
    return (
      <div className="tiptap-reader max-w-none">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/5"></div>
          </div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tiptap-reader max-w-none">
      {/* Reading Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Reading Progress</span>
          <span className="text-sm font-semibold text-chart-1">
            {totalSections ? `${sectionIndex + 1}/${totalSections}` : '1/1'}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-chart-1 to-chart-2 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: totalSections ? `${((sectionIndex + 1) / totalSections) * 100}%` : '100%' }}
          />
        </div>
      </div>

      {/* Learning Objectives (for intro sections) */}
      {title && (title.toLowerCase().includes('pengenalan') || 
          title.toLowerCase().includes('dasar') ||
          title.toLowerCase().includes('apa itu')) && (
        <div className="mb-8 bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-xl p-6 border-l-4 border-chart-1">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-chart-1/20 rounded-lg mr-3">
              <Target className="w-5 h-5 text-chart-1" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground">🎯 Learning Objectives</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            By the end of this section, you'll understand the fundamental concepts of {title.toLowerCase()} and how to apply them in your trading journey.
          </p>
        </div>
      )}

      {/* Reading Info Bar */}
      <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-chart-1/5 to-chart-2/5 rounded-lg border border-chart-1/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-chart-4" />
            <span className="font-medium">{readingTime} min read</span>
          </div>
          {totalSections && (
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 mr-2 text-chart-2" />
              <span className="font-medium">Section {sectionIndex + 1} of {totalSections}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground font-medium">Enhanced Reading</span>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className={`prose prose-lg max-w-none transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'}`}>
        {editor ? (
          <EditorContent 
            editor={editor} 
            className="tiptap-content focus:outline-none"
          />
        ) : (
          // Fallback content if Tiptap fails
          <div className="fallback-content space-y-4">
            {content ? (
              content.split('\n\n').map((paragraph, index) => {
                // Safety check for undefined/null paragraph
                if (!paragraph || typeof paragraph !== 'string') {
                  return null;
                }

                const trimmed = paragraph.trim();
                if (!trimmed) {
                  return null;
                }

                if (trimmed.startsWith('#')) {
                  const matchResult = paragraph.match(/^#+/);
                  const level = matchResult ? matchResult[0].length : 1;
                  const text = paragraph.replace(/^#+\s*\*?\*?/, '').replace(/\*?\*?$/, '');
                  const HeaderTag = `h${Math.min(level + 1, 6)}`;
                  return (
                    <HeaderTag key={index} className={`font-bold text-card-foreground ${
                      level === 1 ? 'text-2xl mb-4' :
                      level === 2 ? 'text-xl mb-3' :
                      level === 3 ? 'text-lg mb-3' :
                      'text-base mb-2'
                    }`}>
                      {text}
                    </HeaderTag>
                  );
                } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  return (
                    <ul key={index} className="space-y-2 mb-4">
                      {paragraph.split('\n').filter(line => line && line.trim()).map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="text-chart-2 mr-3 mt-1">✨</span>
                          <span className="text-card-foreground leading-relaxed">
                            {item.replace(/^[-*]\s*/, '').replace(/\*\*([^*]+)\*\*/g, '$1')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                } else {
                  return (
                    <p key={index} className="text-card-foreground leading-relaxed mb-4">
                      {paragraph.replace(/\*\*([^*]+)\*\*/g, '$1')}
                    </p>
                  );
                }
              }).filter(Boolean)
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Key Concept Box (for technical analysis content) */}
      {(content && typeof content === 'string' && (content.includes('analisis teknikal') || content.includes('technical analysis'))) && (
        <div className="my-8 bg-gradient-to-r from-chart-5/5 to-chart-1/5 border-l-4 border-chart-5 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-chart-5/20 rounded-lg mr-3">
              <span className="text-lg">🔑</span>
            </div>
            <h3 className="text-lg font-bold text-card-foreground">Key Concept: Technical Analysis</h3>
          </div>
          <p className="text-muted-foreground mb-3 italic">
            The study of price movements and patterns to predict future market behavior.
          </p>
          <p className="text-card-foreground leading-relaxed">
            Technical analysis is a fundamental skill that every trader should master. It helps you make informed decisions based on historical price data and market patterns.
          </p>
        </div>
      )}

      {/* Risk Warning (for strategy content) */}
      {title && (title.toLowerCase().includes('strategi') || 
          title.toLowerCase().includes('strategy') ||
          title.toLowerCase().includes('teknik')) && (
        <div className="my-8 bg-gradient-to-r from-destructive/10 to-chart-4/10 rounded-xl p-6 border-l-4 border-destructive">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-destructive/20 rounded-lg mr-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground">⚠️ Risk Management Warning</h3>
          </div>
          <p className="text-card-foreground leading-relaxed">
            Always practice proper risk management. Never risk more than you can afford to lose, and always test strategies on demo accounts first.
          </p>
        </div>
      )}

      {/* Interactive Elements */}
      <div className="my-8 space-y-4">
        {/* Trading Tips */}
        <div className="bg-gradient-to-r from-chart-4/10 to-chart-5/10 rounded-lg p-4 border border-chart-4/20">
          <div className="flex items-start">
            <div className="p-1.5 bg-chart-4/20 rounded-lg mr-3 mt-0.5">
              <Lightbulb className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Remember to always start with paper trading to practice these concepts before using real money. This will help you build confidence and refine your skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CheckCircle2 className="w-6 h-6 text-chart-2 mr-3" />
            <div>
              <span className="text-sm font-semibold text-card-foreground block">
                Section Completed! 🎉
              </span>
              <span className="text-xs text-muted-foreground">
                You're making excellent progress in your trading education.
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground bg-background hover:bg-muted/50 rounded-lg transition-all duration-200 border border-border/60 hover:border-border">
              <Target className="w-4 h-4 mr-2" />
              Practice
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              <TrendingUp className="w-4 h-4 mr-2" />
              Continue Learning
            </button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center pt-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-medium">
            📚 Keep reading to master more trading concepts
          </span>
        </div>
      </div>
    </div>
  );
};

export default TiptapReader;
