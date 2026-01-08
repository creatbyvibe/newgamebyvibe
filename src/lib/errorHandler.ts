import { createAppError, ErrorCode, getUserFriendlyMessage, type AppError } from './errorTypes';

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  /**
   * 处理错误并转换为 AppError
   */
  static handle(error: unknown): AppError {
    // 如果已经是 AppError，直接返回
    if (error && typeof error === 'object' && 'code' in error) {
      return error as AppError;
    }

    // 处理 Supabase 错误
    if (error && typeof error === 'object' && 'message' in error) {
      const supabaseError = error as { message: string; code?: string; status?: number };
      
      // 映射 Supabase 错误代码和 HTTP 状态码
      const codeMap: Record<string, ErrorCode> = {
        'PGRST116': ErrorCode.NOT_FOUND,
        '23505': ErrorCode.DUPLICATE_ERROR,
        '23503': ErrorCode.VALIDATION_ERROR,
        '42501': ErrorCode.FORBIDDEN,
        'PGRST301': ErrorCode.UNAUTHORIZED,
        'PGRST302': ErrorCode.FORBIDDEN, // RLS 策略阻止
      };

      // 如果存在 HTTP 状态码，优先使用状态码映射
      let code = ErrorCode.UNKNOWN_ERROR;
      if (supabaseError.status) {
        const statusCodeMap: Record<number, ErrorCode> = {
          400: ErrorCode.BAD_REQUEST,
          401: ErrorCode.UNAUTHORIZED,
          403: ErrorCode.FORBIDDEN,
          404: ErrorCode.NOT_FOUND,
          409: ErrorCode.DUPLICATE_ERROR,
          422: ErrorCode.VALIDATION_ERROR,
          429: ErrorCode.RATE_LIMIT,
          500: ErrorCode.SERVER_ERROR,
          502: ErrorCode.SERVICE_UNAVAILABLE,
          503: ErrorCode.SERVICE_UNAVAILABLE,
        };
        code = statusCodeMap[supabaseError.status] || code;
      }
      
      // 如果没有状态码映射，使用错误代码映射
      if (code === ErrorCode.UNKNOWN_ERROR && supabaseError.code) {
        code = codeMap[supabaseError.code] || ErrorCode.UNKNOWN_ERROR;
      }
      
      return createAppError(
        code,
        supabaseError.message || '操作失败',
        error,
        supabaseError.status
      );
    }

    // 处理标准 Error 对象
    if (error instanceof Error) {
      return createAppError(
        ErrorCode.UNKNOWN_ERROR,
        error.message,
        error
      );
    }

    // 处理字符串错误
    if (typeof error === 'string') {
      return createAppError(ErrorCode.UNKNOWN_ERROR, error);
    }

    // 未知错误
    return createAppError(
      ErrorCode.UNKNOWN_ERROR,
      '发生未知错误',
      error
    );
  }

  /**
   * 记录错误日志
   */
  static logError(error: AppError | Error | unknown, context?: string): void {
    const appError = error && typeof error === 'object' && 'code' in error
      ? error as AppError
      : this.handle(error);

    const logData = {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      statusCode: appError.statusCode,
      timestamp: appError.timestamp,
      context,
    };

    // 开发环境：输出到控制台
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', logData);
    }

    // 生产环境：发送到错误监控服务（如 Sentry）
    // TODO: 集成 Sentry 或其他错误监控服务
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: logData });
    // }
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserMessage(error: AppError | Error | unknown): string {
    return getUserFriendlyMessage(error);
  }

  /**
   * 判断错误是否可恢复
   */
  static isRecoverable(error: AppError | Error | unknown): boolean {
    const appError = error && typeof error === 'object' && 'code' in error
      ? error as AppError
      : this.handle(error);

    const recoverableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.SERVER_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
    ];

    return recoverableCodes.includes(appError.code);
  }
}
