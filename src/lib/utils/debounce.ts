/**
 * 防抖工具函数
 * 在指定时间内只执行最后一次调用
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * 防抖 Hook（用于 React 组件）
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  const timeoutRef = { current: null as NodeJS.Timeout | null };

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeoutRef.current = null;
      func(...args);
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(later, wait);
  }) as T;
}
