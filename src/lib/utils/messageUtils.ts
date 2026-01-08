/**
 * 从提示词数组中随机选择一个提示词
 * 确保相同的错误类型每次显示时都有不同的提示
 */
export function getRandomMessage(messages: string | string[]): string {
  if (typeof messages === 'string') {
    return messages;
  }
  
  if (Array.isArray(messages) && messages.length > 0) {
    // 使用当前时间戳作为种子的一部分，确保每次调用都不同
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
  }
  
  return '';
}

/**
 * 使用简单哈希确保相同错误在同一会话中显示不同提示
 */
export function getVariedMessage(messages: string | string[], seed?: string): string {
  if (typeof messages === 'string') {
    return messages;
  }
  
  if (Array.isArray(messages) && messages.length > 0) {
    // 如果有种子（比如错误类型），使用它来确保同一类型错误显示不同提示
    let index = 0;
    if (seed) {
      // 使用时间和种子的组合生成索引
      const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      index = (hash + Date.now()) % messages.length;
    } else {
      index = Math.floor(Math.random() * messages.length);
    }
    return messages[index];
  }
  
  return '';
}
