import { gameLabService } from '@/services/gameLabService';
import { validateGameCode, validateCardGameCode } from './gameCodeValidator';
import type { GenerateGameInput } from '@/services/gameLabService';

export interface RetryOptions {
  maxRetries?: number;
  isCardGame?: boolean;
  onRetry?: (attempt: number) => void;
}

/**
 * Generate game with automatic retry on validation failure
 */
export async function generateWithRetry(
  input: GenerateGameInput,
  options: RetryOptions = {},
  onChunk?: (chunk: string) => void
): Promise<string> {
  const maxRetries = options.maxRetries ?? 3;
  const isCardGame = options.isCardGame ?? false;
  const validator = isCardGame ? validateCardGameCode : validateGameCode;

  let lastError: string | null = null;
  let lastCode = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (options.onRetry && attempt > 1) {
        options.onRetry(attempt);
      }

      // Adjust prompt for retry
      let adjustedInput = { ...input };
      if (attempt > 1) {
        // Add more specific instructions on retry
        const retryInstructions = `
          
重要提示（重试 ${attempt}/${maxRetries}）：
- 确保代码完整且可立即运行
- 必须包含所有必要的HTML、CSS和JavaScript
- 游戏必须完全可玩，没有占位符或TODO
- 确保所有函数都已实现
- 确保游戏有清晰的开始和结束状态
`;

        adjustedInput = {
          ...input,
          prompt: (input.prompt || '') + retryInstructions,
        };
      }

      // Generate game code
      const code = await gameLabService.generateGame(adjustedInput, onChunk);
      lastCode = code;

      // Validate the generated code
      const validation = validator(code);

      if (validation.isValid) {
        // Code is valid, return it
        return code;
      } else {
        // Code has errors, prepare for retry
        lastError = validation.errors.join('; ');
        console.warn(`[generateWithRetry] Attempt ${attempt} failed validation:`, validation.errors);

        if (attempt < maxRetries) {
          // Adjust input for next attempt
          const errorFeedback = `\n\n之前的生成有以下问题：${validation.errors.join(', ')}。请确保这些问题都已解决。`;
          adjustedInput = {
            ...input,
            prompt: (input.prompt || '') + errorFeedback,
          };
          input = adjustedInput;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[generateWithRetry] Attempt ${attempt} error:`, error);

      if (attempt === maxRetries) {
        throw error;
      }
    }
  }

  // All retries exhausted
  if (lastCode) {
    // Return the last generated code even if it has warnings
    console.warn('[generateWithRetry] Max retries reached, returning last generated code');
    return lastCode;
  }

  throw new Error(`生成失败：${lastError || '未知错误'}`);
}
