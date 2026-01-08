/**
 * 错误类型定义
 */

export enum ErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // 请求错误
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT = 'RATE_LIMIT',
  
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // 数据错误
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  
  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp: number;
}

/**
 * 创建应用错误对象
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  details?: any,
  statusCode?: number
): AppError {
  return {
    code,
    message,
    details,
    statusCode,
    timestamp: Date.now(),
  };
}

/**
 * 从错误对象获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: AppError | Error | unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const appError = error as AppError;
    
    const messageMap: Record<ErrorCode, string> = {
      [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查您的网络设置',
      [ErrorCode.TIMEOUT_ERROR]: '请求超时，请稍后重试',
      [ErrorCode.BAD_REQUEST]: '请求参数错误，请检查后重试',
      [ErrorCode.RATE_LIMIT]: '请求过于频繁，请稍后再试',
      [ErrorCode.UNAUTHORIZED]: '您尚未登录，请先登录',
      [ErrorCode.FORBIDDEN]: '您没有权限执行此操作',
      [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
      [ErrorCode.NOT_FOUND]: '未找到请求的资源',
      [ErrorCode.VALIDATION_ERROR]: '输入数据验证失败，请检查后重试',
      [ErrorCode.DUPLICATE_ERROR]: '数据已存在，请勿重复提交',
      [ErrorCode.SERVER_ERROR]: '服务器错误，请稍后重试',
      [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后重试',
      [ErrorCode.UNKNOWN_ERROR]: '发生未知错误，请稍后重试',
    };

    return messageMap[appError.code] || appError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '发生未知错误，请稍后重试';
}
