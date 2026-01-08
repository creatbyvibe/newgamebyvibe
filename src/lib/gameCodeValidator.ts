/**
 * Game Code Validator
 * Validates generated HTML game code for completeness and playability
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate game code structure and key elements
 */
export function validateGameCode(htmlCode: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!htmlCode || typeof htmlCode !== 'string' || htmlCode.trim().length === 0) {
    return {
      isValid: false,
      errors: ['代码为空'],
      warnings: [],
    };
  }

  // Check for basic HTML structure
  if (!htmlCode.includes('<!DOCTYPE html>') && !htmlCode.includes('<html')) {
    errors.push('缺少HTML文档结构');
  }

  // Check for essential HTML elements
  if (!htmlCode.includes('<head>') && !htmlCode.includes('<head ')) {
    warnings.push('缺少<head>标签');
  }

  if (!htmlCode.includes('<body>') && !htmlCode.includes('<body ')) {
    errors.push('缺少<body>标签');
  }

  // Check for script tag (JavaScript)
  if (!htmlCode.includes('<script')) {
    errors.push('缺少JavaScript代码（<script>标签）');
  }

  // Check for style tag or inline styles (CSS)
  if (!htmlCode.includes('<style') && !htmlCode.includes('style=')) {
    warnings.push('缺少CSS样式（建议添加<style>标签）');
  }

  // Check for common game elements
  const hasCanvas = htmlCode.includes('<canvas');
  const hasButtons = htmlCode.includes('<button') || htmlCode.includes('onclick=');
  const hasDivs = htmlCode.includes('<div');

  if (!hasCanvas && !hasDivs) {
    warnings.push('缺少游戏容器元素（建议使用<canvas>或<div>）');
  }

  if (!hasButtons && !htmlCode.includes('addEventListener')) {
    warnings.push('缺少交互元素（建议添加按钮或事件监听器）');
  }

  // Check for game loop indicators
  const hasGameLoop = 
    htmlCode.includes('gameLoop') ||
    htmlCode.includes('requestAnimationFrame') ||
    htmlCode.includes('setInterval') ||
    htmlCode.includes('setTimeout');

  if (!hasGameLoop) {
    warnings.push('可能缺少游戏循环（建议使用requestAnimationFrame或setInterval）');
  }

  // Check for game state management
  const hasGameState = 
    htmlCode.includes('gameState') ||
    htmlCode.includes('state') ||
    htmlCode.includes('playing') ||
    htmlCode.includes('gameover');

  if (!hasGameState) {
    warnings.push('可能缺少游戏状态管理');
  }

  // Check for essential game functions
  const hasStartFunction = 
    htmlCode.includes('startGame') ||
    htmlCode.includes('start()') ||
    htmlCode.includes('init()');

  if (!hasStartFunction) {
    warnings.push('可能缺少游戏启动函数');
  }

  // Check for complete HTML structure
  if (htmlCode.includes('<html') && !htmlCode.includes('</html>')) {
    errors.push('HTML标签未正确闭合');
  }

  // Check for potential issues
  if (htmlCode.includes('TODO') || htmlCode.includes('FIXME') || htmlCode.includes('placeholder')) {
    warnings.push('代码中包含TODO或占位符，可能未完成');
  }

  // Check code length (too short might be incomplete)
  if (htmlCode.length < 500) {
    warnings.push('代码较短，可能不完整');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate card game specific requirements
 */
export function validateCardGameCode(htmlCode: string): ValidationResult {
  const baseResult = validateGameCode(htmlCode);
  const errors = [...baseResult.errors];
  const warnings = [...baseResult.warnings];

  // Card game specific checks
  const hasCardElements = 
    htmlCode.includes('card') ||
    htmlCode.includes('Card') ||
    htmlCode.includes('deck') ||
    htmlCode.includes('Deck') ||
    htmlCode.includes('hand') ||
    htmlCode.includes('Hand');

  if (!hasCardElements) {
    warnings.push('可能缺少卡牌相关元素（card, deck, hand等）');
  }

  const hasCardInteraction = 
    htmlCode.includes('playCard') ||
    htmlCode.includes('drawCard') ||
    htmlCode.includes('discard') ||
    htmlCode.includes('click') ||
    htmlCode.includes('onclick');

  if (!hasCardInteraction) {
    warnings.push('可能缺少卡牌交互逻辑（出牌、抽卡等）');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
