-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Original content table
CREATE TABLE original_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remix outputs table
CREATE TABLE remix_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_content_id UUID REFERENCES original_content(id) ON DELETE CASCADE,
  remix_type VARCHAR(50) NOT NULL,
  remixed_content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  favorite_remix_types TEXT[] DEFAULT '{}',
  default_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content tags junction table
CREATE TABLE content_tags (
  original_content_id UUID REFERENCES original_content(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (original_content_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_original_content_hash ON original_content(content_hash);
CREATE INDEX idx_remix_outputs_content_id ON remix_outputs(original_content_id);
CREATE INDEX idx_remix_outputs_type ON remix_outputs(remix_type);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_content_tags_content_id ON content_tags(original_content_id);
CREATE INDEX idx_content_tags_tag_id ON content_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE original_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (you can modify these later for user-specific access)
CREATE POLICY "Allow public read access to original_content" ON original_content
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to remix_outputs" ON remix_outputs
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to content_tags" ON content_tags
  FOR SELECT USING (true);

-- Allow public insert access for now (you can restrict this later)
CREATE POLICY "Allow public insert access to original_content" ON original_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access to remix_outputs" ON remix_outputs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access to tags" ON tags
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access to content_tags" ON content_tags
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_original_content_updated_at 
  BEFORE UPDATE ON original_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
