import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Comment = Database['public']['Tables']['creation_comments']['Row'];
type CommentInsert = Database['public']['Tables']['creation_comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['creation_comments']['Update'];

export interface CreateCommentInput {
  creation_id: string;
  content: string;
  rating?: number;
  parent_id?: string;
}

export interface CommentWithProfile extends Comment {
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

/**
 * 评论服务
 * 封装所有与评论相关的 API 调用
 */
export const commentService = {
  /**
   * 获取创作的评论列表
   */
  async getCommentsByCreationId(
    creationId: string
  ): Promise<CommentWithProfile[]> {
    const comments = await apiClient.query(() =>
      supabase
        .from('creation_comments')
        .select('*')
        .eq('creation_id', creationId)
        .order('created_at', { ascending: false })
    );

    // 获取用户信息
    const commentsWithProfiles = await Promise.all(
      comments.map(async (comment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', comment.user_id)
          .single();

        return {
          ...comment,
          profile: profile || undefined,
        } as CommentWithProfile;
      })
    );

    return commentsWithProfiles;
  },

  /**
   * 创建评论
   */
  async createComment(input: CreateCommentInput): Promise<Comment> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('用户未登录');
    }

    return apiClient.query(() =>
      supabase
        .from('creation_comments')
        .insert({
          ...input,
          user_id: session.session.user.id,
        })
        .select()
        .single()
    );
  },

  /**
   * 更新评论
   */
  async updateComment(
    id: string,
    content: string
  ): Promise<Comment> {
    return apiClient.query(() =>
      supabase
        .from('creation_comments')
        .update({ content })
        .eq('id', id)
        .select()
        .single()
    );
  },

  /**
   * 删除评论
   */
  async deleteComment(id: string): Promise<void> {
    return apiClient.execute(() =>
      supabase.from('creation_comments').delete().eq('id', id)
    );
  },

  /**
   * 获取评论的回复
   */
  async getReplies(parentId: string): Promise<CommentWithProfile[]> {
    const replies = await apiClient.query(() =>
      supabase
        .from('creation_comments')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })
    );

    // 获取用户信息
    const repliesWithProfiles = await Promise.all(
      replies.map(async (reply) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', reply.user_id)
          .single();

        return {
          ...reply,
          profile: profile || undefined,
        } as CommentWithProfile;
      })
    );

    return repliesWithProfiles;
  },
};
