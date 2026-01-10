/**
 * 日志工具
 * 在生产环境中禁用调试输出，开发环境中保留
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/**
 * 开发环境日志
 */
export const devLog = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // 错误日志在生产环境也保留，但可以发送到错误追踪服务
    if (isDev) {
      console.error(...args);
    } else {
      // 生产环境：可以发送到 Sentry 等错误追踪服务
      // ErrorHandler.logError 已经处理了错误记录
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

/**
 * 生产环境安全的错误日志
 * 用于记录需要追踪的错误
 */
export const safeErrorLog = (error: unknown, context?: string) => {
  // 在生产环境中，错误应该通过 ErrorHandler 记录
  // 这里只用于开发环境的调试
  if (isDev) {
    console.error(`[${context || 'Error'}]`, error);
  }
};
