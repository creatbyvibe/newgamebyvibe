import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface UserProfile extends Profile {
  user?: User;
}

/**
 * 用户服务
 * 封装所有与用户相关的 API 调用
 */
export const userService = {
  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: session } = await supabase.auth.getSession();
    return session?.session?.user ?? null;
  },

  /**
   * 获取用户资料
   */
  async getProfile(userId: string): Promise<Profile | null> {
    return apiClient.queryNullable(() =>
      supabase.from('profiles').select('*').eq('id', userId).single()
    );
  },

  /**
   * 更新用户资料
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<Profile> {
    return apiClient.query(() =>
      supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
    );
  },

  /**
   * 获取用户点赞的创作列表
   */
  async getUserLikes(userId: string): Promise<string[]> {
    const likes = await apiClient.query(() =>
      supabase
        .from('creation_likes')
        .select('creation_id')
        .eq('user_id', userId)
    );

    return likes.map((like) => like.creation_id);
  },

  /**
   * 检查用户是否点赞了某个创作
   */
  async hasLiked(userId: string, creationId: string): Promise<boolean> {
    const { data } = await supabase
      .from('creation_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('creation_id', creationId)
      .single();

    return !!data;
  },

  /**
   * 切换点赞状态
   */
  async toggleLike(userId: string, creationId: string): Promise<boolean> {
    const hasLiked = await this.hasLiked(userId, creationId);

    if (hasLiked) {
      await apiClient.execute(() =>
        supabase
          .from('creation_likes')
          .delete()
          .eq('user_id', userId)
          .eq('creation_id', creationId)
      );
      return false;
    } else {
      await apiClient.execute(() =>
        supabase
          .from('creation_likes')
          .insert({
            user_id: userId,
            creation_id: creationId,
          })
      );
      return true;
    }
  },

  /**
   * 检查用户是否收藏了某个创作
   */
  async hasBookmarked(userId: string, creationId: string): Promise<boolean> {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('creation_id', creationId)
      .maybeSingle();

    return !!data;
  },

  /**
   * 切换收藏状态
   */
  async toggleBookmark(userId: string, creationId: string): Promise<boolean> {
    const hasBookmarked = await this.hasBookmarked(userId, creationId);

    if (hasBookmarked) {
      await apiClient.execute(() =>
        supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('creation_id', creationId)
      );
      return false;
    } else {
      await apiClient.execute(() =>
        supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            creation_id: creationId,
          })
      );
      return true;
    }
  },

  /**
   * 获取用户收藏的创作列表
   */
  async getBookmarks(userId: string): Promise<string[]> {
    const bookmarks = await apiClient.query(() =>
      supabase
        .from('bookmarks')
        .select('creation_id')
        .eq('user_id', userId)
    );

    return bookmarks.map((bookmark) => bookmark.creation_id);
  },
};
