// @ts-nocheck
/**
 * Tutorials Page - Main tutorials listing
 * Shows all tutorials with filtering and search capabilities
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, TrendingUp } from 'lucide-react';
import tutorialAPI from '@/lib/api/tutorials';
import TutorialCard from '@/components/tutorials/TutorialCard';

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [error, setError] = useState(null);

  // Load tutorials and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [tutorialsData, categoriesData] = await Promise.all([
          tutorialAPI.getTutorials(),
          tutorialAPI.getCategories()
        ]);
        
        setTutorials(tutorialsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load tutorials. Please try again later.');
        console.error('Error loading tutorials:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort tutorials
  const filteredTutorials = useMemo(() => {
    let filtered = [...tutorials];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tutorial => 
        tutorial.title.toLowerCase().includes(query) ||
        tutorial.description.toLowerCase().includes(query) ||
        tutorial.category.toLowerCase().includes(query) ||
        (tutorial.tags && tutorial.tags.some(tag => tag.name.toLowerCase().includes(query)))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(tutorial => tutorial.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(tutorial => tutorial.difficulty_level === selectedDifficulty);
    }

    // Sort tutorials
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 } as Record<string, number>;
        filtered.sort((a, b) => difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level]);
        break;
      case 'read_time':
        filtered.sort((a, b) => (a.estimated_read_time || 0) - (b.estimated_read_time || 0));
        break;
      case 'sections':
        filtered.sort((a, b) => (b.section_count || 0) - (a.section_count || 0));
        break;
      default: // 'order'
        filtered.sort((a, b) => a.order_index - b.order_index);
        break;
    }

    return filtered;
  }, [tutorials, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('order');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedDifficulty || sortBy !== 'order';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-card-border p-6 shadow-sm">
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </div>
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
        <div className="text-center p-8">
          <div className="text-destructive text-xl mb-4">⚠️ Error Loading Tutorials</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-chart-1/10 rounded-xl mr-4">
              <BookOpen className="w-8 h-8 text-chart-1" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Trading Tutorials
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Learn from comprehensive guides
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
            Master trading from basics to advanced strategies with our interactive, step-by-step tutorials designed for traders at every level.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border border-card-border shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="order">Recommended Order</option>
                <option value="title">Title (A-Z)</option>
                <option value="difficulty">Difficulty</option>
                <option value="read_time">Reading Time</option>
                <option value="sections">Section Count</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Showing {filteredTutorials.length} of {tutorials.length} tutorials
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-chart-1 hover:text-chart-1/80 text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredTutorials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No tutorials found
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Try adjusting your filters to discover more tutorials that match your interests."
                : "No tutorials are currently available. Check back soon!"
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map(tutorial => (
              <TutorialCard 
                key={tutorial.id} 
                tutorial={tutorial}
                showAnalytics={true}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {tutorials.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-5/10 border border-card-border rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-chart-1 mb-2 group-hover:scale-110 transition-transform">
                  {tutorials.length}
                </div>
                <div className="text-muted-foreground font-medium">Total Tutorials</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-chart-2 mb-2 group-hover:scale-110 transition-transform">
                  {categories.length}
                </div>
                <div className="text-muted-foreground font-medium">Categories</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-chart-5 mb-2 group-hover:scale-110 transition-transform">
                  {tutorials.reduce((sum, tutorial) => sum + (tutorial.section_count || 0), 0)}
                </div>
                <div className="text-muted-foreground font-medium">Total Sections</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
