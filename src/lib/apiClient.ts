import { supabase } from '@/integrations/supabase/client';

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

    const message = error?.message || '操作失败，请重试';
    const code = error?.code || 'UNKNOWN_ERROR';
    const status = error?.status || 500;

    // 记录错误日志
    console.error('[ApiClient] Error:', { message, code, status, error });

    return new ApiClientError(message, code, status);
  }

  /**
   * 执行 Supabase 查询
   */
  async query<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();

      if (error) {
        throw this.handleError(error);
      }

      if (data === null) {
        throw new ApiClientError('未找到数据', 'NOT_FOUND', 404);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  /**
   * 执行 Supabase 查询（允许 null）
   */
  async queryNullable<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    try {
      const { data, error } = await queryFn();

      if (error) {
        throw this.handleError(error);
      }

      return data;
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new ApiClientError('Supabase 配置错误', 'CONFIG_ERROR', 500);
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
        throw new ApiClientError(
          `请求失败: ${response.statusText || errorText}`,
          'FUNCTION_ERROR',
          response.status
        );
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
