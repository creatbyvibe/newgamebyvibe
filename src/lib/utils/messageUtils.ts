/**
 * 从提示词数组中随机选择一个提示词
 * 确保相同的错误类型每次显示时都有不同的提示
 * 支持 i18next 返回的对象格式（当翻译键是数组时，i18next 可能返回对象）
 */
export function getRandomMessage(messages: string | string[] | any): string {
  // 如果是字符串，直接返回
  if (typeof messages === 'string') {
    return messages;
  }
  
  // 如果是数组，随机选择一个
  if (Array.isArray(messages) && messages.length > 0) {
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
  }
  
  // 如果是对象（i18next 可能返回对象），尝试提取数组
  if (messages && typeof messages === 'object' && !Array.isArray(messages)) {
    // 首先检查对象的值是否是字符串数组（i18next 可能将数组转换为对象）
    const values = Object.values(messages);
    
    // 如果所有值都是字符串，说明这是一个对象化的数组（如 {0: "msg1", 1: "msg2"}）
    if (values.length > 0 && values.every(v => typeof v === 'string')) {
      const index = Math.floor(Math.random() * values.length);
      return values[index] as string;
    }
    
    // 检查对象是否有数组属性
    if (Array.isArray(messages.messages)) {
      const index = Math.floor(Math.random() * messages.messages.length);
      return messages.messages[index];
    }
    
    // 尝试从对象的任何数组属性获取
    for (const key in messages) {
      if (Array.isArray(messages[key]) && messages[key].length > 0) {
        const index = Math.floor(Math.random() * messages[key].length);
        return messages[key][index];
      }
    }
    
    // 如果对象有数字键（0, 1, 2...），尝试按顺序提取
    const numericKeys = Object.keys(messages)
      .filter(k => !isNaN(Number(k)))
      .map(k => Number(k))
      .sort((a, b) => a - b);
    
    if (numericKeys.length > 0) {
      const index = Math.floor(Math.random() * numericKeys.length);
      const key = numericKeys[index];
      const value = messages[key];
      if (typeof value === 'string') {
        return value;
      }
    }
  }
  
  // 如果无法处理，返回空字符串
  console.warn('getRandomMessage: Unable to extract message from:', messages);
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
