import { supabase, getSupabaseConfig } from '@/integrations/supabase/client';
import { deduplicatedFetch } from '@/lib/utils/requestDeduplication';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiClientError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

/**
 * 统一 API 客户端
 * 提供统一的错误处理、日志记录和请求拦截
 */
export class ApiClient {
  /**
   * 处理 Supabase 错误
   */
  private handleError(error: any): ApiClientError {
    if (error instanceof ApiClientError) {
      return error;
    }

    let message = error?.message || '操作失败，请重试';
    let code = error?.code || 'UNKNOWN_ERROR';
    let status = error?.status || 500;

    // 处理 Supabase HTTP 错误
    if (error?.status) {
      status = error.status;
      code = this.mapHttpStatusToErrorCode(status);
      message = this.getErrorMessage(status, error.message);
    }

    // 处理 Supabase PostgREST 错误代码
    if (error?.code && typeof error.code === 'string') {
      const pgCode = this.mapSupabaseCodeToErrorCode(error.code);
      if (pgCode) {
        code = pgCode;
        message = this.getSupabaseErrorMessage(error.code, error.message) || message;
      }
    }

    // 记录错误日志
    console.error('[ApiClient] Error:', { message, code, status, error });

    return new ApiClientError(message, code, status);
  }

  /**
   * 将 HTTP 状态码映射到错误代码
   */
  private mapHttpStatusToErrorCode(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'DUPLICATE_ERROR',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  /**
   * 将 Supabase 错误代码映射到错误代码
   */
  private mapSupabaseCodeToErrorCode(supabaseCode: string): string | null {
    const codeMap: Record<string, string> = {
      'PGRST116': 'NOT_FOUND',      // 未找到
      '23505': 'DUPLICATE_ERROR',   // 唯一约束违反
      '23503': 'VALIDATION_ERROR',  // 外键约束违反
      '42501': 'FORBIDDEN',         // 权限不足
      'PGRST301': 'UNAUTHORIZED',   // 认证失败
      'PGRST302': 'FORBIDDEN',      // RLS 策略阻止
    };
    return codeMap[supabaseCode] || null;
  }

  /**
   * 获取 HTTP 状态码对应的错误消息
   */
  private getErrorMessage(status: number, originalMessage?: string): string {
    const messageMap: Record<number, string> = {
      400: '请求参数错误',
      401: '认证失败，请刷新页面后重试',
      403: '没有权限访问此资源',
      404: '请求的资源不存在',
      409: '数据已存在，请勿重复创建',
      422: '数据验证失败',
      429: '请求过于频繁，请稍后再试',
      500: '服务器错误，请稍后重试',
      502: '服务暂时不可用，请稍后重试',
      503: '服务暂时不可用，请稍后重试',
    };

    return messageMap[status] || originalMessage || '操作失败，请重试';
  }

  /**
   * 获取 Supabase 错误代码对应的错误消息
   */
  private getSupabaseErrorMessage(code: string, originalMessage?: string): string | null {
    const messageMap: Record<string, string> = {
      'PGRST116': '未找到请求的数据',
      '23505': '数据已存在，请勿重复创建',
      '23503': '关联数据不存在',
      '42501': '权限不足，无法执行此操作',
      'PGRST301': '认证失败，请刷新页面后重试',
      'PGRST302': '没有权限访问此资源，可能是 RLS 策略限制',
    };

    return messageMap[code] || originalMessage || null;
  }

  /**
   * 执行 Supabase 查询
   * 添加类型守卫确保数据不为 null
   */
  async query<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();

      if (error) {
        throw this.handleError(error);
      }

      // 类型守卫：确保数据不为 null
      if (data === null || data === undefined) {
        throw new ApiClientError('未找到数据', 'NOT_FOUND', 404);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  /**
   * 执行 Supabase 查询（允许 null）
   * 添加类型守卫确保正确的返回类型
   */
  async queryNullable<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    try {
      const { data, error } = await queryFn();

      if (error) {
        throw this.handleError(error);
      }

      // 明确返回类型，包括 null 和 undefined 的情况
      return data ?? null;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  /**
   * 执行 Supabase 操作（不返回数据）
   */
  async execute(
    queryFn: () => Promise<{ error: any }>
  ): Promise<void> {
    try {
      const { error } = await queryFn();

      if (error) {
        throw this.handleError(error);
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  /**
   * 调用 Edge Function
   */
  async invokeFunction<T = any>(
    functionName: string,
    body?: any,
    options?: {
      method?: 'POST' | 'GET';
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        method: options?.method || 'POST',
        headers: options?.headers,
      });

      if (error) {
        throw this.handleError(error);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  /**
   * 调用 Edge Function（流式响应）
   */
  async invokeFunctionStream(
    functionName: string,
    body?: any,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const session = await supabase.auth.getSession();
      
      // 从统一的配置源获取 URL 和 Key，确保与客户端实例一致
      const config = getSupabaseConfig();
      const supabaseUrl = config.url;
      const supabaseKey = config.key;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new ApiClientError(
          'Supabase 配置错误：环境变量未配置',
          'CONFIG_ERROR',
          500
        );
      }
      
      // 验证 URL 格式
      if (!supabaseUrl.startsWith('https://') || supabaseUrl.includes('placeholder')) {
        throw new ApiClientError(
          `Supabase URL 配置错误: ${supabaseUrl}. 请在 Vercel Dashboard 配置正确的 VITE_SUPABASE_URL`,
          'CONFIG_ERROR',
          500
        );
      }
      
      // 验证 Key 格式
      if (!supabaseKey || supabaseKey.includes('placeholder')) {
        throw new ApiClientError(
          'Supabase Key 配置错误：请在 Vercel Dashboard 配置正确的 VITE_SUPABASE_PUBLISHABLE_KEY',
          'CONFIG_ERROR',
          500
        );
      }
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session?.access_token || supabaseKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorMessage = `请求失败: ${response.statusText || errorText}`;
        let errorCode = 'FUNCTION_ERROR';
        
        // 根据 HTTP 状态码提供更友好的错误信息
        if (response.status === 401) {
          errorMessage = '认证失败，请刷新页面后重试';
          errorCode = 'UNAUTHORIZED';
        } else if (response.status === 403) {
          errorMessage = '没有权限访问此资源';
          errorCode = 'FORBIDDEN';
        } else if (response.status === 404) {
          errorMessage = '请求的资源不存在';
          errorCode = 'NOT_FOUND';
        } else if (response.status >= 500) {
          errorMessage = '服务器错误，请稍后重试';
          errorCode = 'SERVER_ERROR';
        }
        
        throw new ApiClientError(errorMessage, errorCode, response.status);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new ApiClientError('服务器未返回数据', 'NO_RESPONSE', 500);
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onChunk?.(content);
            }
          } catch (parseError) {
            // 忽略解析错误，继续处理
          }
        }
      }

      return fullContent;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw this.handleError(error);
    }
  }
}

// 导出单例
export const apiClient = new ApiClient();
