import { apiClient } from '@/lib/apiClient';

export interface GameFusionInput {
  selectedGames: Array<{
    id: string;
    name: string;
    emoji: string;
    description: string;
  }>;
}

export interface GameFusionResult {
  name: string;
  description: string;
  scores: {
    creativity: number;
    playability: number;
    weirdness: number;
    addiction: number;
    overall: number;
    comment: string;
  };
}

export interface GenerateGameInput {
  fusionResult?: GameFusionResult;
  prompt?: string;
}

// 兼容旧的调用方式
export interface GameFusionInputLegacy {
  selectedGames: Array<{
    id: string;
    name: string;
    emoji: string;
    description: string;
  }>;
}

/**
 * 游戏实验室服务
 * 封装所有与游戏实验室相关的 API 调用
 */
export const gameLabService = {
  /**
   * 融合游戏概念
   */
  async fuseGames(input: GameFusionInput | GameFusionInputLegacy): Promise<GameFusionResult> {
    // 统一处理输入格式
    const games = input.selectedGames.map(g => ({ name: g.name, description: g.description }));
    
    return apiClient.invokeFunction<GameFusionResult>(
      'game-lab-fusion',
      { games }
    );
  },

  /**
   * 生成游戏代码（流式响应）
   */
  async generateGame(
    input: GenerateGameInput,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // 构建 prompt
    let prompt = input.prompt || '';
    if (input.fusionResult) {
      prompt = prompt 
        ? `${prompt}\n\nGame concept: ${input.fusionResult.name} - ${input.fusionResult.description}`
        : `Game concept: ${input.fusionResult.name} - ${input.fusionResult.description}`;
    }
    
    return apiClient.invokeFunctionStream(
      'generate-creation',
      { prompt },
      onChunk
    );
  },
};
