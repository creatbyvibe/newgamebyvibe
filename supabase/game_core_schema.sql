-- Game Core Optimization Database Schema
-- Run this in Supabase SQL Editor
-- This extends the existing database with game categories and templates

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game Categories Table
-- Stores different game categories (Card Games, Action Games, Strategy Games, etc.)
CREATE TABLE IF NOT EXISTS game_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  icon TEXT, -- Icon identifier or emoji
  description TEXT,
  description_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  -- Metadata stores category-specific configuration
  -- For card games: rarity system, card types, effect types, etc.
  metadata JSONB DEFAULT '{}',
  -- System prompt for this category
  system_prompt TEXT,
  system_prompt_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Templates Table
-- Stores pre-built game templates for each category
CREATE TABLE IF NOT EXISTS game_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES game_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  -- Complete playable HTML code example
  example_code TEXT NOT NULL,
  -- Template-specific configuration
  config JSONB DEFAULT '{}',
  -- Usage statistics
  usage_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage of successful generations using this template
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend creations table with category and template references
-- These fields are nullable to maintain backward compatibility
ALTER TABLE creations 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES game_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES game_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS game_config JSONB DEFAULT '{}';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_categories_is_active ON game_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_game_categories_display_order ON game_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_game_templates_category_id ON game_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_game_templates_difficulty ON game_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_templates_is_active ON game_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_creations_category_id ON creations(category_id);
CREATE INDEX IF NOT EXISTS idx_creations_template_id ON creations(template_id);

-- Enable Row Level Security
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_categories
-- Public read access for all users
CREATE POLICY "Public can view active game categories"
  ON game_categories FOR SELECT
  USING (is_active = true);

-- RLS Policies for game_templates
-- Public read access for all users
CREATE POLICY "Public can view active game templates"
  ON game_templates FOR SELECT
  USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_core_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_game_categories_updated_at
  BEFORE UPDATE ON game_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_game_core_updated_at();

CREATE TRIGGER update_game_templates_updated_at
  BEFORE UPDATE ON game_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_game_core_updated_at();

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE game_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update template success rate
CREATE OR REPLACE FUNCTION update_template_success_rate(
  template_id_param UUID,
  success_count INTEGER,
  total_count INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE game_templates
  SET success_rate = CASE 
    WHEN total_count > 0 THEN (success_count::DECIMAL / total_count::DECIMAL * 100)
    ELSE 0.00
  END
  WHERE id = template_id_param;
END;
$$ LANGUAGE plpgsql;
