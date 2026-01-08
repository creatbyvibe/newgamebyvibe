import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/integrations/supabase/client';
import type { GameTemplate, GameDifficulty } from '@/types/game';

/**
 * 游戏模板服务
 * 封装所有与游戏模板相关的 API 调用
 */
export const templateService = {
  /**
   * 根据类别获取模板列表
   */
  async getTemplatesByCategory(
    categoryId: string,
    difficulty?: GameDifficulty
  ): Promise<GameTemplate[]> {
    if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
      throw new Error('Invalid category ID');
    }

    let query = supabase
      .from('game_templates')
      .select('*')
      .eq('category_id', categoryId.trim())
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    return apiClient.query(() => query);
  },

  /**
   * 根据 ID 获取模板
   */
  async getTemplateById(id: string): Promise<GameTemplate | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid template ID');
    }

    return apiClient.queryNullable(() =>
      supabase
        .from('game_templates')
        .select('*')
        .eq('id', id.trim())
        .maybeSingle()
    );
  },

  /**
   * 增加模板使用次数
   */
  async incrementUsageCount(templateId: string): Promise<void> {
    if (!templateId || typeof templateId !== 'string' || templateId.trim() === '') {
      throw new Error('Invalid template ID');
    }

    // Use RPC function if available, otherwise use direct update
    try {
      await apiClient.execute(() =>
        supabase.rpc('increment_template_usage', {
          template_id_param: templateId.trim(),
        })
      );
    } catch (error) {
      // Fallback to direct update if RPC function doesn't exist
      console.warn('[templateService] RPC function not available, using direct update');
      // Get current count and increment
      const { data: current } = await supabase
        .from('game_templates')
        .select('usage_count')
        .eq('id', templateId.trim())
        .single();
      
      if (current) {
        await apiClient.execute(() =>
          supabase
            .from('game_templates')
            .update({ usage_count: (current.usage_count || 0) + 1 })
            .eq('id', templateId.trim())
        );
      }
    }
  },

  /**
   * 更新模板成功率
   */
  async updateSuccessRate(
    templateId: string,
    successCount: number,
    totalCount: number
  ): Promise<void> {
    if (!templateId || typeof templateId !== 'string' || templateId.trim() === '') {
      throw new Error('Invalid template ID');
    }

    if (successCount < 0 || totalCount < 0 || successCount > totalCount) {
      throw new Error('Invalid success count or total count');
    }

    // Use RPC function if available, otherwise use direct update
    try {
      await apiClient.execute(() =>
        supabase.rpc('update_template_success_rate', {
          template_id_param: templateId.trim(),
          success_count: successCount,
          total_count: totalCount,
        })
      );
    } catch (error) {
      // Fallback to direct update if RPC function doesn't exist
      console.warn('[templateService] RPC function not available, using direct update');
      const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
      await apiClient.execute(() =>
        supabase
          .from('game_templates')
          .update({ success_rate: successRate })
          .eq('id', templateId.trim())
      );
    }
  },
};
