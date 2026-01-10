/**
 * 节流工具函数
 * 在指定时间内最多执行一次
 */

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 节流 Hook（用于 React 组件）
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  const throttleRef = { current: { inThrottle: false, timeout: null as NodeJS.Timeout | null } };

  return ((...args: Parameters<T>) => {
    if (!throttleRef.current.inThrottle) {
      func(...args);
      throttleRef.current.inThrottle = true;
      throttleRef.current.timeout = setTimeout(() => {
        throttleRef.current.inThrottle = false;
      }, limit);
    }
  }) as T;
}
