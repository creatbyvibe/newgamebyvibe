/**
 * 请求去重工具
 * 防止相同请求在短时间内重复发送
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_DEDUP_WINDOW = 1000; // 1秒内的相同请求会被去重

/**
 * 生成请求的唯一标识
 */
function getRequestKey(url: string, options?: RequestInit): string {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

/**
 * 带去重的 fetch 包装器
 */
export async function deduplicatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const key = getRequestKey(url, options);
  const now = Date.now();

  // 检查是否有相同的待处理请求
  const pending = pendingRequests.get(key);
  if (pending && now - pending.timestamp < REQUEST_DEDUP_WINDOW) {
    // 返回相同的 Promise
    return pending.promise;
  }

  // 创建新请求
  const promise = fetch(url, options).finally(() => {
    // 请求完成后移除
    pendingRequests.delete(key);
  });

  // 保存待处理请求
  pendingRequests.set(key, {
    promise,
    timestamp: now,
  });

  return promise;
}

/**
 * 清除所有待处理的请求
 */
export function clearPendingRequests(): void {
  pendingRequests.clear();
}
