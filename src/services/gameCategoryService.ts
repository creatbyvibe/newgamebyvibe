import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/integrations/supabase/client';
import type { GameCategory } from '@/types/game';

/**
 * 游戏类别服务
 * 封装所有与游戏类别相关的 API 调用
 */
export const gameCategoryService = {
  /**
   * 获取所有活跃的类别
   */
  async getActiveCategories(): Promise<GameCategory[]> {
    return apiClient.query(() =>
      supabase
        .from('game_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
    );
  },

  /**
   * 根据 ID 获取类别
   */
  async getCategoryById(id: string): Promise<GameCategory | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid category ID');
    }

    return apiClient.queryNullable(() =>
      supabase
        .from('game_categories')
        .select('*')
        .eq('id', id.trim())
        .maybeSingle()
    );
  },

  /**
   * 根据名称获取类别
   */
  async getCategoryByName(name: string): Promise<GameCategory | null> {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Invalid category name');
    }

    return apiClient.queryNullable(() =>
      supabase
        .from('game_categories')
        .select('*')
        .eq('name', name.trim())
        .maybeSingle()
    );
  },
};
