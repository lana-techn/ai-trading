/**
 * Enhanced Tutorial Content Component
 * Displays tutorial content in a readable, structured format
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, BookOpen, CheckCircle } from 'lucide-react';
import { parseTutorialContent, extractKeyPoints, formatTextEmphasis } from '@/lib/tutorialParser';

const TutorialContent = ({ content, title }) => {
  const [expandedSections, setExpandedSections] = useState(new Set([0])); // First section expanded by default
  
  if (!content) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No content available for this section.</p>
      </div>
    );
  }

  const parsedContent = parseTutorialContent(content);
  const keyPoints = extractKeyPoints(content);
  
  const toggleSection = (index) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const renderContent = (element, index) => {
    switch (element.type) {
      case 'header':
        const isExpanded = expandedSections.has(index);
        const HeaderTag = `h${Math.min(element.level + 2, 6)}`;
        
        return (
          <div key={index} className="mb-6">
            <button
              onClick={() => toggleSection(index)}
              className="flex items-center w-full text-left group hover:bg-muted/30 p-3 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 mr-3 text-chart-1 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-chart-1 flex-shrink-0" />
              )}
              <HeaderTag className={`font-bold leading-tight group-hover:text-chart-1 transition-colors ${
                element.level === 1 ? 'text-xl lg:text-2xl' :
                element.level === 2 ? 'text-lg lg:text-xl' :
                'text-base lg:text-lg'
              }`}>
                {element.content}
              </HeaderTag>
            </button>
            
            {isExpanded && (
              <div className="ml-8 mt-4 pl-4 border-l-2 border-chart-1/20">
                <div className="animate-in">
                  {/* Placeholder for content that would follow this header */}
                  <div className="text-muted-foreground leading-relaxed">
                    <em>Section content would be displayed here...</em>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'paragraph':
        return (
          <div key={index} className="mb-6">
            <div 
              className="text-card-foreground leading-relaxed text-base lg:text-lg"
              dangerouslySetInnerHTML={{ __html: formatTextEmphasis(element.content) }}
            />
          </div>
        );
        
      case 'list':
        return (
          <div key={index} className="mb-6">
            <div className="bg-muted/30 rounded-lg p-5 border-l-4 border-chart-2">
              <ul className="space-y-3">
                {element.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-chart-2 mt-0.5 mr-3 flex-shrink-0" />
                    <span 
                      className="text-card-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatTextEmphasis(item) }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case 'numbered-list':
        return (
          <div key={index} className="mb-6">
            <div className="bg-chart-1/5 rounded-lg p-5 border-l-4 border-chart-1">
              <ol className="space-y-3">
                {element.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-chart-1 text-white text-sm font-semibold rounded-full mr-3 mt-0.5 flex-shrink-0">
                      {itemIndex + 1}
                    </span>
                    <span 
                      className="text-card-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatTextEmphasis(item) }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-none">
      {/* Key Points Summary - if available */}
      {keyPoints.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-chart-4/10 to-chart-5/10 rounded-xl p-6 border border-chart-4/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-chart-4/20 rounded-lg mr-3">
              <Lightbulb className="w-5 h-5 text-chart-4" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground">Key Points</h3>
          </div>
          <div className="grid gap-3">
            {keyPoints.map((point, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-chart-4 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                <p className="text-card-foreground leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-2">
        {parsedContent.length > 0 ? (
          parsedContent.map(renderContent)
        ) : (
          // Fallback to simple text display
          <div className="space-y-6">
            {content.split('\n\n').map((paragraph, index) => (
              <div key={index}>
                {paragraph.trim().startsWith('#') ? (
                  <h3 className="text-xl font-bold text-card-foreground mb-4 leading-tight">
                    {paragraph.replace(/^#+\s*\*?\*?/, '').replace(/\*?\*?$/, '')}
                  </h3>
                ) : paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*') ? (
                  <div className="bg-muted/30 rounded-lg p-5 border-l-4 border-chart-2 mb-4">
                    <ul className="space-y-2">
                      {paragraph.split('\n').filter(line => line.trim()).map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-chart-2 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-card-foreground leading-relaxed">
                            {item.replace(/^[-*]\s*/, '').replace(/\*\*([^*]+)\*\*/g, '$1')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-card-foreground leading-relaxed text-base lg:text-lg mb-4">
                    {paragraph.replace(/\*\*([^*]+)\*\*/g, '$1')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reading Progress Indicator */}
      <div className="mt-12 pt-6 border-t border-border/60">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Section: {title}</span>
          <span>📖 Keep reading to learn more</span>
        </div>
      </div>
    </div>
  );
};

export default TutorialContent;