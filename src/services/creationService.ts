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
   * 允许匿名用户访问，使用 RLS 策略保护
   */
  async getPublicCreations(limit = 6): Promise<Creation[]> {
    try {
      return await apiClient.query(() =>
        supabase
          .from('creations')
          .select('*')
          .eq('is_public', true)
          .order('likes', { ascending: false })
          .limit(limit)
      );
    } catch (error) {
      // 401/403 错误可能表示 RLS 策略问题或认证问题
      // 记录错误并重新抛出，让调用者处理
      console.error('[creationService.getPublicCreations] Error:', error);
      throw error;
    }
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
   * 添加输入验证和类型守卫
   */
  async getCreationById(id: string): Promise<Creation | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid creation ID');
    }
    
    return apiClient.queryNullable(() =>
      supabase.from('creations').select('*').eq('id', id.trim()).maybeSingle()
    );
  },

  /**
   * 创建新创作
   * 添加输入验证和类型守卫
   */
  async createCreation(input: CreateCreationInput): Promise<Creation> {
    // 输入验证
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: input must be an object');
    }
    
    if (!input.title || typeof input.title !== 'string' || input.title.trim() === '') {
      throw new Error('Invalid input: title is required');
    }
    
    if (!input.html_code || typeof input.html_code !== 'string') {
      throw new Error('Invalid input: html_code is required');
    }
    
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      throw new Error('用户未登录');
    }

    return apiClient.query(() =>
      supabase
        .from('creations')
        .insert({
          title: input.title.trim(),
          prompt: input.prompt || '',
          html_code: input.html_code,
          is_public: input.is_public ?? false,
          user_id: session.session.user.id,
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

  /**
   * 创建版本记录
   */
  async createVersion(
    creationId: string,
    version: number,
    htmlCode: string,
    changeNote?: string
  ): Promise<void> {
    if (!creationId || typeof creationId !== 'string' || creationId.trim() === '') {
      throw new Error('Invalid creation ID');
    }
    
    if (!htmlCode || typeof htmlCode !== 'string') {
      throw new Error('Invalid html code');
    }

    return apiClient.execute(() =>
      supabase
        .from('creation_versions')
        .insert({
          creation_id: creationId.trim(),
          version,
          html_code: htmlCode,
          change_note: changeNote || null,
        })
    );
  },

  /**
   * 获取创作的所有版本
   */
  async getVersions(creationId: string): Promise<Array<{
    id: string;
    version: number;
    html_code: string;
    change_note: string | null;
    created_at: string | null;
  }>> {
    if (!creationId || typeof creationId !== 'string' || creationId.trim() === '') {
      throw new Error('Invalid creation ID');
    }

    return apiClient.query(() =>
      supabase
        .from('creation_versions')
        .select('id, version, html_code, change_note, created_at')
        .eq('creation_id', creationId.trim())
        .order('version', { ascending: false })
    );
  },

  /**
   * 根据版本号获取特定版本
   */
  async getVersionById(creationId: string, version: number): Promise<{
    id: string;
    version: number;
    html_code: string;
    change_note: string | null;
    created_at: string | null;
  } | null> {
    if (!creationId || typeof creationId !== 'string' || creationId.trim() === '') {
      throw new Error('Invalid creation ID');
    }

    return apiClient.queryNullable(() =>
      supabase
        .from('creation_versions')
        .select('id, version, html_code, change_note, created_at')
        .eq('creation_id', creationId.trim())
        .eq('version', version)
        .maybeSingle()
    );
  },
};
