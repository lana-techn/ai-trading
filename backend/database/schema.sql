-- Tutorial Management Schema for Supabase
-- This schema handles tutorial content with sections and metadata

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  estimated_read_time INTEGER, -- in minutes
  order_index INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published',
  meta_keywords TEXT[], -- Array of SEO keywords
  author VARCHAR(100) DEFAULT 'AI Trading Agent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create sections table (each tutorial can have multiple sections)
CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'markdown', -- 'markdown', 'html', 'text'
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutorial_id, slug)
);

-- Create tutorial_tags table for flexible tagging
CREATE TABLE IF NOT EXISTS tutorial_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create many-to-many relationship for tutorial tags
CREATE TABLE IF NOT EXISTS tutorial_tag_relations (
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tutorial_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tutorial_id, tag_id)
);

-- Create tutorial_analytics table for tracking
CREATE TABLE IF NOT EXISTS tutorial_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE NULL,
  view_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_read_time DECIMAL(5,2), -- in minutes
  bounce_rate DECIMAL(4,2), -- percentage
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_status ON tutorials(status);
CREATE INDEX IF NOT EXISTS idx_tutorials_published_at ON tutorials(published_at);
CREATE INDEX IF NOT EXISTS idx_tutorials_order ON tutorials(order_index);
CREATE INDEX IF NOT EXISTS idx_sections_tutorial_id ON sections(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(tutorial_id, order_index);
CREATE INDEX IF NOT EXISTS idx_analytics_tutorial_id ON tutorial_analytics(tutorial_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tutorials_updated_at 
    BEFORE UPDATE ON tutorials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at 
    BEFORE UPDATE ON sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at 
    BEFORE UPDATE ON tutorial_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
-- Allow public read access to published tutorials
CREATE POLICY "Public tutorials are viewable by everyone" 
ON tutorials FOR SELECT 
USING (status = 'published');

CREATE POLICY "Public sections are viewable by everyone" 
ON sections FOR SELECT 
USING (is_visible = true AND EXISTS (
  SELECT 1 FROM tutorials 
  WHERE tutorials.id = sections.tutorial_id 
  AND tutorials.status = 'published'
));

-- Allow public read access to tags
CREATE POLICY "Tags are viewable by everyone" 
ON tutorial_tags FOR SELECT 
USING (true);

CREATE POLICY "Tag relations are viewable by everyone" 
ON tutorial_tag_relations FOR SELECT 
USING (true);

-- Allow public read access to analytics (for view counts, etc.)
CREATE POLICY "Analytics are viewable by everyone" 
ON tutorial_analytics FOR SELECT 
USING (true);

-- Insert default tags
INSERT INTO tutorial_tags (name, color) VALUES 
('Trading Basics', '#10B981'),
('Technical Analysis', '#3B82F6'),
('Risk Management', '#EF4444'),
('Strategy', '#8B5CF6'),
('Psychology', '#F59E0B'),
('Forex', '#06B6D4'),
('Stocks', '#84CC16'),
('Crypto', '#F97316'),
('Beginner', '#6B7280'),
('Advanced', '#1F2937')
ON CONFLICT (name) DO NOTHING;

-- Create view for tutorial with sections count
CREATE VIEW tutorial_summary AS
SELECT 
    t.*,
    COUNT(s.id) as section_count,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'id', tt.id,
            'name', tt.name,
            'color', tt.color
        )
    ) FILTER (WHERE tt.id IS NOT NULL) as tags
FROM tutorials t
LEFT JOIN sections s ON t.id = s.tutorial_id AND s.is_visible = true
LEFT JOIN tutorial_tag_relations ttr ON t.id = ttr.tutorial_id
LEFT JOIN tutorial_tags tt ON ttr.tag_id = tt.id
WHERE t.status = 'published'
GROUP BY t.id
ORDER BY t.order_index, t.created_at DESC;

-- Grant permissions for anon users (public access)
GRANT SELECT ON tutorials TO anon;
GRANT SELECT ON sections TO anon;
GRANT SELECT ON tutorial_tags TO anon;
GRANT SELECT ON tutorial_tag_relations TO anon;
GRANT SELECT ON tutorial_analytics TO anon;
GRANT SELECT ON tutorial_summary TO anon;

-- Grant permissions for authenticated users
GRANT SELECT ON tutorials TO authenticated;
GRANT SELECT ON sections TO authenticated;
GRANT SELECT ON tutorial_tags TO authenticated;
GRANT SELECT ON tutorial_tag_relations TO authenticated;
GRANT SELECT ON tutorial_analytics TO authenticated;
GRANT SELECT ON tutorial_summary TO authenticated;