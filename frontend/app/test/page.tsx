'use client';

import React, { useState, useEffect } from 'react';
import ImageUpload from '@/components/chat/ImageUpload';
import { 
  getAllSymbols, 
  getSymbolsByCategory, 
  getPopularSymbols,
  getTrendingSymbols,
  searchSymbols,
  getMarketData,
  getWatchlistData,
  SYMBOL_CATEGORIES
} from '@/lib/mock-data';
import imageUploadService from '@/lib/imageUploadService';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ImageUploadResponse {
  success: boolean;
  data?: any;
  publicUrl?: string;
  error?: string;
}

export default function TestPage() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [uploadHistory, setUploadHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof SYMBOL_CATEGORIES>('TECH');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    imageUploadEnabled: boolean;
    supabaseConnected: boolean;
    symbolDataLoaded: boolean;
    categoriesLoaded: boolean;
  }>({ 
    imageUploadEnabled: false, 
    supabaseConnected: false, 
    symbolDataLoaded: false, 
    categoriesLoaded: false 
  });

  useEffect(() => {
    // Run initial tests
    const runTests = async () => {
      setTestResults({
        imageUploadEnabled: imageUploadService.isImageUploadEnabled(),
        supabaseConnected: checkSupabaseConnection(),
        symbolDataLoaded: getAllSymbols().length > 0,
        categoriesLoaded: Object.keys(SYMBOL_CATEGORIES).length > 0
      });
      
      // Load initial market data
      setMarketData(getMarketData(selectedSymbol));
      
      // Load user's uploaded images
      try {
        const imagesResult = await imageUploadService.getUserImages();
        if (imagesResult.success) {
          setUploadedImages(imagesResult.data || []);
        }
      } catch (error) {
        console.log('Could not load user images (may not be authenticated)');
      }
    };
    
    runTests();
  }, [selectedSymbol]);

  useEffect(() => {
    // Update search results when query changes
    if (searchQuery.length > 0) {
      setSearchResults(searchSymbols(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const checkSupabaseConnection = (): boolean => {
    try {
      return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    } catch {
      return false;
    }
  };

  const handleImageUploaded = (uploadResponse: ImageUploadResponse) => {
    if (uploadResponse.success && uploadResponse.data) {
      setUploadHistory(prev => [
        `✅ ${uploadResponse.data!.file_name} uploaded at ${new Date().toLocaleTimeString()}`,
        ...prev.slice(0, 4) // Keep only last 5 entries
      ]);
      
      // Refresh uploaded images list
      imageUploadService.getUserImages().then(result => {
        if (result.success) {
          setUploadedImages(result.data || []);
        }
      });
    }
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setMarketData(getMarketData(symbol));
      setIsLoading(false);
    }, 500);
  };

  const popularSymbols = getPopularSymbols();
  const trendingSymbols = getTrendingSymbols();
  const categorySymbols = getSymbolsByCategory(selectedCategory);
  const watchlistData = getWatchlistData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">🧪 Test Implementation</h1>
        <p className="text-muted-foreground">
          Testing image upload functionality and expanded crypto/stock data
        </p>
      </div>

      {/* Test Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={cn(
          "p-4 rounded-lg border",
          testResults.imageUploadEnabled ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
        )}>
          <div className="flex items-center gap-2">
            {testResults.imageUploadEnabled ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600" />
            )}
            <span className={cn(
              "font-medium",
              testResults.imageUploadEnabled ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            )}>
              Image Upload
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {testResults.imageUploadEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>

        <div className={cn(
          "p-4 rounded-lg border",
          testResults.supabaseConnected ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
        )}>
          <div className="flex items-center gap-2">
            {testResults.supabaseConnected ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            )}
            <span className={cn(
              "font-medium",
              testResults.supabaseConnected ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"
            )}>
              Supabase
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {testResults.supabaseConnected ? 'Connected' : 'Not configured'}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">
              Symbol Data
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {getAllSymbols().length} symbols loaded
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">
              Categories
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {Object.keys(SYMBOL_CATEGORIES).length} categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Upload Test */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <PhotoIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Image Upload Test</h2>
          </div>
          
          <ImageUpload 
            onImageUploaded={handleImageUploaded}
            enableSupabaseUpload={true}
            className="max-w-md"
          />
          
          {/* Upload History */}
          {uploadHistory.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Recent Uploads:</h3>
              <div className="space-y-1">
                {uploadHistory.map((entry, index) => (
                  <p key={index} className="text-sm font-mono text-muted-foreground">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Your Images ({uploadedImages.length}):</h3>
              <div className="space-y-2">
                {uploadedImages.slice(0, 3).map((image) => (
                  <div key={image.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 mr-2">{image.file_name}</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      image.upload_status === 'completed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      {image.upload_status}
                    </span>
                  </div>
                ))}
                {uploadedImages.length > 3 && (
                  <p className="text-xs text-muted-foreground">+ {uploadedImages.length - 3} more...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Symbol Data Test */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Symbol Data Test</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbols (e.g., BTC, AAPL, Tesla...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Search Results:</h3>
              <div className="grid grid-cols-3 gap-2">
                {searchResults.slice(0, 9).map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => handleSymbolChange(symbol)}
                    className="px-3 py-1 bg-background border border-border rounded text-sm hover:bg-muted transition-colors"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-2">Categories:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(SYMBOL_CATEGORIES).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as keyof typeof SYMBOL_CATEGORIES)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-colors",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {categorySymbols.slice(0, 9).map(symbol => (
                <button
                  key={symbol}
                  onClick={() => handleSymbolChange(symbol)}
                  className={cn(
                    "px-3 py-1 bg-background border rounded text-sm transition-colors",
                    selectedSymbol === symbol
                      ? "border-primary text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          
          {/* Popular Symbols */}
          <div>
            <h3 className="font-medium mb-2">Popular:</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Stocks:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {popularSymbols.stocks.map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => handleSymbolChange(symbol)}
                      className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Crypto:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {popularSymbols.crypto.map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => handleSymbolChange(symbol)}
                      className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded text-xs hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Market Data Display */}
          {marketData && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4" />
                {selectedSymbol} Data
                {isLoading && <ClockIcon className="h-4 w-4 animate-spin" />}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2 font-mono">${marketData.quoteData.price.toFixed(marketData.symbolType === 'crypto' && marketData.quoteData.price < 1 ? 6 : 2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Change:</span>
                  <span className={cn(
                    "ml-2 font-mono",
                    marketData.quoteData.change >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {marketData.quoteData.change >= 0 ? '+' : ''}{marketData.quoteData.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="ml-2 font-mono">{marketData.quoteData.volume}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize">{marketData.symbolType}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {marketData.candlestickData.length} data points • Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-8 bg-muted/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Implementation Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{getAllSymbols().length}</div>
            <div className="text-muted-foreground">Total Symbols</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Object.keys(SYMBOL_CATEGORIES).length}</div>
            <div className="text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{uploadedImages.length}</div>
            <div className="text-muted-foreground">Your Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Object.keys(watchlistData).length}</div>
            <div className="text-muted-foreground">Watchlist Items</div>
          </div>
        </div>
      </div>
    </div>
  );
}