import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Creation = Database['public']['Tables']['creations']['Row'];
type CreationInsert = Database['public']['Tables']['creations']['Insert'];
type CreationUpdate = Database['public']['Tables']['creations']['Update'];

export interface CreateCreationInput {
  title: string;
  prompt: string;
  html_code: string;
  is_public?: boolean;
}

export interface UpdateCreationInput {
  title?: string;
  prompt?: string;
  html_code?: string;
  is_public?: boolean;
}

/**
 * 创作服务
 * 封装所有与创作相关的 API 调用
 */
export const creationService = {
  /**
   * 获取用户的所有创作
   */
  async getUserCreations(userId: string): Promise<Creation[]> {
    return apiClient.query(() =>
      supabase
        .from('creations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  /**
   * 获取公开的创作列表
   */
  async getPublicCreations(limit = 6): Promise<Creation[]> {
    return apiClient.query(() =>
      supabase
        .from('creations')
        .select('*')
        .eq('is_public', true)
        .order('likes', { ascending: false })
        .limit(limit)
    );
  },

  /**
   * 获取所有公开创作（不限制数量，用于客户端排序）
   */
  async getAllPublicCreations(): Promise<Creation[]> {
    return apiClient.query(() =>
      supabase
        .from('creations')
        .select('*')
        .eq('is_public', true)
    );
  },

  /**
   * 根据 ID 获取创作
   */
  async getCreationById(id: string): Promise<Creation | null> {
    return apiClient.queryNullable(() =>
      supabase.from('creations').select('*').eq('id', id).single()
    );
  },

  /**
   * 创建新创作
   */
  async createCreation(input: CreateCreationInput): Promise<Creation> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('用户未登录');
    }

    return apiClient.query(() =>
      supabase
        .from('creations')
        .insert({
          ...input,
          user_id: session.session.user.id,
          is_public: input.is_public ?? false,
        })
        .select()
        .single()
    );
  },

  /**
   * 更新创作
   */
  async updateCreation(
    id: string,
    input: UpdateCreationInput
  ): Promise<Creation> {
    return apiClient.query(() =>
      supabase
        .from('creations')
        .update(input)
        .eq('id', id)
        .select()
        .single()
    );
  },

  /**
   * 删除创作
   */
  async deleteCreation(id: string): Promise<void> {
    return apiClient.execute(() =>
      supabase.from('creations').delete().eq('id', id)
    );
  },

  /**
   * 增加播放次数
   */
  async incrementPlays(id: string): Promise<void> {
    return apiClient.execute(() =>
      supabase.rpc('increment_plays', { creation_id: id })
    );
  },

  /**
   * 搜索创作
   */
  async searchCreations(query: string, limit = 20): Promise<Creation[]> {
    return apiClient.query(() =>
      supabase
        .from('creations')
        .select('*')
        .eq('is_public', true)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  },
};
