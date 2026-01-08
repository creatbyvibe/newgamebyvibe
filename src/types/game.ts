/**
 * Game Core Types
 * Type definitions for game categories, templates, and configurations
 */

export type GameDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Game Category
 * Represents a game category (e.g., Card Games, Action Games, Strategy Games)
 */
export interface GameCategory {
  id: string;
  name: string;
  name_en: string;
  icon?: string;
  description?: string;
  description_en?: string;
  is_active: boolean;
  display_order: number;
  metadata: GameCategoryMetadata;
  system_prompt?: string;
  system_prompt_en?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Game Category Metadata
 * Stores category-specific configuration
 */
export interface GameCategoryMetadata {
  // Card game specific
  rarity_system?: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };
  card_types?: string[];
  effect_types?: string[];
  // General category configuration
  mechanics?: string[];
  constraints?: string[];
  best_practices?: string[];
  [key: string]: unknown;
}

/**
 * Game Template
 * Represents a pre-built game template for a category
 */
export interface GameTemplate {
  id: string;
  category_id: string;
  name: string;
  name_en: string;
  description?: string;
  description_en?: string;
  difficulty: GameDifficulty;
  example_code: string;
  config: GameTemplateConfig;
  usage_count: number;
  success_rate: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Game Template Config
 * Template-specific configuration
 */
export interface GameTemplateConfig {
  theme?: string;
  mechanics?: string[];
  features?: string[];
  [key: string]: unknown;
}

/**
 * Creation Config
 * Configuration for a game creation
 */
export interface CreationConfig {
  category_id?: string;
  template_id?: string;
  difficulty?: GameDifficulty;
  theme?: string;
  mechanics?: string[];
  custom_prompt?: string;
  [key: string]: unknown;
}

/**
 * Game Generation Input
 * Input for generating a game
 */
export interface GameGenerationInput {
  prompt: string;
  category_id?: string;
  template_id?: string;
  config?: CreationConfig;
}

/**
 * Game Generation Result
 * Result of game generation
 */
export interface GameGenerationResult {
  html_code: string;
  title?: string;
  description?: string;
  success: boolean;
  error?: string;
}
