/**
 * Fallback tutorial data when Supabase is unavailable
 * Provides mock data to ensure the app works even without database connection
 */

export const FALLBACK_TUTORIALS = [
  {
    id: 'fallback-1',
    title: 'Introduction to Trading',
    slug: 'introduction-to-trading',
    description: 'Learn the fundamentals of trading, including market basics, order types, and essential trading concepts.',
    category: 'Basics',
    difficulty_level: 'beginner',
    estimated_read_time: 15,
    status: 'published',
    order_index: 1,
    published_at: new Date('2024-01-01'),
    sections: [
      { 
        id: 's1-1', 
        title: 'What is Trading?',
        slug: 'what-is-trading',
        content: 'Trading is the act of buying and selling financial instruments such as stocks, bonds, currencies, and commodities with the goal of generating profits from price movements.',
        order_index: 1,
        is_visible: true,
      },
      { 
        id: 's1-2',
        title: 'Market Basics',
        slug: 'market-basics',
        content: 'Understanding market dynamics is crucial. Markets operate through the forces of supply and demand, with prices fluctuating based on various factors including economic data, company performance, and investor sentiment.',
        order_index: 2,
        is_visible: true,
      },
      { 
        id: 's1-3',
        title: 'Order Types',
        slug: 'order-types',
        content: 'Learn about different order types: Market orders execute immediately at current price, Limit orders execute at specific price, and Stop orders trigger when price reaches certain level.',
        order_index: 3,
        is_visible: true,
      },
    ],
    tutorial_tag_relations: [
      {
        tutorial_tags: {
          id: 't1',
          name: 'Basics',
          color: '#3B82F6',
        },
      },
    ],
  },
  {
    id: 'fallback-2',
    title: 'Technical Analysis Fundamentals',
    slug: 'technical-analysis-fundamentals',
    description: 'Master the art of reading charts, identifying patterns, and understanding technical indicators.',
    category: 'Technical Analysis',
    difficulty_level: 'beginner',
    estimated_read_time: 20,
    status: 'published',
    order_index: 2,
    published_at: new Date('2024-01-05'),
    sections: [
      { 
        id: 's2-1',
        title: 'Introduction to Technical Analysis',
        slug: 'introduction-to-technical-analysis',
        content: 'Technical analysis is the study of historical price data and trading volume to identify patterns and predict future price movements. This approach is fundamental for traders seeking to make informed decisions.',
        order_index: 1,
        is_visible: true,
      },
      { 
        id: 's2-2',
        title: 'Chart Patterns',
        slug: 'chart-patterns',
        content: 'Chart patterns like head and shoulders, double tops/bottoms, and triangles provide visual cues about potential market direction. Learning to recognize these patterns is essential for technical analysis.',
        order_index: 2,
        is_visible: true,
      },
      { 
        id: 's2-3',
        title: 'Technical Indicators',
        slug: 'technical-indicators',
        content: 'Popular indicators include Moving Averages (MA), Relative Strength Index (RSI), MACD, and Bollinger Bands. Each indicator offers unique insights into market trends and momentum.',
        order_index: 3,
        is_visible: true,
      },
      { 
        id: 's2-4',
        title: 'Support and Resistance',
        slug: 'support-and-resistance',
        content: 'Support levels act as price floors where buying pressure prevents further decline. Resistance levels act as price ceilings where selling pressure prevents further rise. These are key concepts in technical analysis.',
        order_index: 4,
        is_visible: true,
      },
    ],
    tutorial_tag_relations: [
      {
        tutorial_tags: {
          id: 't2',
          name: 'Technical Analysis',
          color: '#10B981',
        },
      },
    ],
  },
  {
    id: 'fallback-3',
    title: 'Risk Management Strategies',
    slug: 'risk-management-strategies',
    description: 'Protect your capital with proven risk management techniques and position sizing strategies.',
    category: 'Risk Management',
    difficulty_level: 'intermediate',
    estimated_read_time: 25,
    status: 'published',
    order_index: 3,
    published_at: new Date('2024-01-10'),
    sections: [
      { 
        id: 's3-1',
        title: 'Understanding Risk',
        slug: 'understanding-risk',
        content: 'Risk management is the cornerstone of successful trading. Every trade carries risk, and understanding how to quantify and manage it is crucial for long-term profitability.',
        order_index: 1,
        is_visible: true,
      },
      { 
        id: 's3-2',
        title: 'Position Sizing',
        slug: 'position-sizing',
        content: 'Position sizing determines how much capital to allocate to each trade. Common methods include fixed percentage (1-2% of capital per trade) and volatility-based sizing.',
        order_index: 2,
        is_visible: true,
      },
      { 
        id: 's3-3',
        title: 'Stop-Loss Strategies',
        slug: 'stop-loss-strategies',
        content: 'Stop-loss orders protect your capital by automatically closing positions at predetermined levels. Setting appropriate stop-losses balances risk protection with giving trades room to work.',
        order_index: 3,
        is_visible: true,
      },
      { 
        id: 's3-4',
        title: 'Risk-Reward Ratio',
        slug: 'risk-reward-ratio',
        content: 'A risk-reward ratio of 1:2 or better means potential profit is at least twice the potential loss. This ensures you can be profitable even with a win rate below 50%.',
        order_index: 4,
        is_visible: true,
      },
      { 
        id: 's3-5',
        title: 'Portfolio Diversification',
        slug: 'portfolio-diversification',
        content: 'Diversification spreads risk across multiple assets, reducing the impact of any single losing trade. Consider diversifying across different markets, timeframes, and strategies.',
        order_index: 5,
        is_visible: true,
      },
    ],
    tutorial_tag_relations: [
      {
        tutorial_tags: {
          id: 't3',
          name: 'Risk Management',
          color: '#F59E0B',
        },
      },
    ],
  },
  {
    id: 'fallback-4',
    title: 'Advanced Trading Strategies',
    slug: 'advanced-trading-strategies',
    description: 'Explore sophisticated trading strategies including swing trading, day trading, and algorithmic approaches.',
    category: 'Strategies',
    difficulty_level: 'advanced',
    estimated_read_time: 30,
    status: 'published',
    order_index: 4,
    published_at: new Date('2024-01-15'),
    sections: [
      { 
        id: 's4-1',
        title: 'Swing Trading',
        slug: 'swing-trading',
        content: 'Swing trading captures medium-term price movements over days to weeks. This strategy balances the intensity of day trading with the patience required for position trading.',
        order_index: 1,
        is_visible: true,
      },
      { 
        id: 's4-2',
        title: 'Day Trading Techniques',
        slug: 'day-trading-techniques',
        content: 'Day trading involves opening and closing positions within the same trading day. Key techniques include scalping for small profits, momentum trading, and range trading in sideways markets.',
        order_index: 2,
        is_visible: true,
      },
      { 
        id: 's4-3',
        title: 'Algorithmic Trading',
        slug: 'algorithmic-trading',
        content: 'Algorithmic trading uses computer programs to execute trades based on predefined criteria. It removes emotional decision-making and can execute strategies faster than manual trading.',
        order_index: 3,
        is_visible: true,
      },
      { 
        id: 's4-4',
        title: 'Advanced Pattern Recognition',
        slug: 'advanced-pattern-recognition',
        content: 'Beyond basic patterns, advanced traders recognize complex formations like Elliott Waves, Fibonacci retracements, and harmonic patterns that provide deeper market insights.',
        order_index: 4,
        is_visible: true,
      },
    ],
    tutorial_tag_relations: [
      {
        tutorial_tags: {
          id: 't4',
          name: 'Advanced',
          color: '#EF4444',
        },
      },
      {
        tutorial_tags: {
          id: 't5',
          name: 'Strategies',
          color: '#8B5CF6',
        },
      },
    ],
  },
  {
    id: 'fallback-5',
    title: 'Market Psychology and Emotions',
    slug: 'market-psychology-and-emotions',
    description: 'Understand the psychological aspects of trading and how to manage emotions for better decision-making.',
    category: 'Psychology',
    difficulty_level: 'intermediate',
    estimated_read_time: 18,
    status: 'published',
    order_index: 5,
    published_at: new Date('2024-01-20'),
    sections: [
      { 
        id: 's5-1',
        title: 'Trading Psychology Basics',
        slug: 'trading-psychology-basics',
        content: 'Emotions like fear and greed significantly impact trading decisions. Understanding your psychological triggers helps maintain discipline and stick to your trading plan.',
        order_index: 1,
        is_visible: true,
      },
      { 
        id: 's5-2',
        title: 'Managing Emotions',
        slug: 'managing-emotions',
        content: 'Develop techniques to manage emotions: take breaks after losses, celebrate wins appropriately, maintain a trading journal, and never trade while angry or overly confident.',
        order_index: 2,
        is_visible: true,
      },
      { 
        id: 's5-3',
        title: 'Building Discipline',
        slug: 'building-discipline',
        content: 'Discipline means following your trading plan consistently regardless of recent outcomes. Set clear rules for entry, exit, and risk management, then stick to them without exception.',
        order_index: 3,
        is_visible: true,
      },
    ],
    tutorial_tag_relations: [
      {
        tutorial_tags: {
          id: 't6',
          name: 'Psychology',
          color: '#EC4899',
        },
      },
    ],
  },
];

export const FALLBACK_CATEGORIES = [
  { name: 'Basics', count: 1 },
  { name: 'Technical Analysis', count: 1 },
  { name: 'Risk Management', count: 1 },
  { name: 'Strategies', count: 1 },
  { name: 'Psychology', count: 1 },
];

export const FALLBACK_TAGS = [
  { id: 't1', name: 'Basics', slug: 'basics', color: '#3B82F6' },
  { id: 't2', name: 'Technical Analysis', slug: 'technical-analysis', color: '#10B981' },
  { id: 't3', name: 'Risk Management', slug: 'risk-management', color: '#F59E0B' },
  { id: 't4', name: 'Advanced', slug: 'advanced', color: '#EF4444' },
  { id: 't5', name: 'Strategies', slug: 'strategies', color: '#8B5CF6' },
  { id: 't6', name: 'Psychology', slug: 'psychology', color: '#EC4899' },
];
