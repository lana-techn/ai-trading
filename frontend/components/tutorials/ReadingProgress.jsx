/**
 * Reading Progress Component
 * Shows reading progress and estimated time remaining
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';

const ReadingProgress = ({ sections, estimatedReadTime }) => {
  const [readSections, setReadSections] = useState(new Set());
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((_, index) => 
        document.getElementById(`section-${index}`)
      ).filter(Boolean);

      if (sectionElements.length === 0) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sectionElements.forEach((element, index) => {
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        
        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          setCurrentSection(index);
        }
        
        // Mark as read if user has scrolled past 80% of the section
        if (scrollPosition >= elementTop + (element.offsetHeight * 0.8)) {
          setReadSections(prev => new Set([...prev, index]));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const progress = (readSections.size / sections.length) * 100;
  const remainingTime = estimatedReadTime ? Math.max(0, Math.round(estimatedReadTime * (1 - progress / 100))) : 0;

  return (
    <div className="sticky top-4 bg-card border border-card-border rounded-xl p-4 shadow-sm">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="font-medium">Reading Progress</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-chart-1 to-chart-2 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Time Remaining */}
      {estimatedReadTime && (
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4 mr-2 text-chart-4" />
          <span>
            {remainingTime > 0 ? `${remainingTime} min remaining` : 'Completed! 🎉'}
          </span>
        </div>
      )}

      {/* Section List */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-card-foreground mb-3">Sections</div>
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => {
              document.getElementById(`section-${index}`)?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className={`flex items-center w-full text-left p-2 rounded-lg transition-all duration-200 ${
              index === currentSection 
                ? 'bg-chart-1/10 text-chart-1 border border-chart-1/20' 
                : readSections.has(index)
                ? 'text-card-foreground hover:bg-muted/50'
                : 'text-muted-foreground hover:bg-muted/30 hover:text-card-foreground'
            }`}
          >
            {readSections.has(index) ? (
              <CheckCircle className="w-4 h-4 mr-3 text-chart-2 flex-shrink-0" />
            ) : (
              <div className={`w-4 h-4 mr-3 rounded-full border-2 flex-shrink-0 ${
                index === currentSection 
                  ? 'border-chart-1 bg-chart-1/20' 
                  : 'border-muted-foreground/30'
              }`} />
            )}
            <span className="text-sm font-medium truncate">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Completion Badge */}
      {progress === 100 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-chart-2/10 to-chart-1/10 rounded-lg border border-chart-2/20">
          <div className="flex items-center text-sm text-chart-2 font-medium">
            <CheckCircle className="w-5 h-5 mr-2" />
            Tutorial Completed!
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingProgress;