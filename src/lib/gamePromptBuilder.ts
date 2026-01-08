import type { GameCategory, GameTemplate, CreationConfig } from '@/types/game';

/**
 * Category Prompt Builder
 * Builds optimized prompts based on game category and template
 */
export class CategoryPromptBuilder {
  /**
   * Build optimized prompt for game generation
   */
  static buildPrompt(
    category: GameCategory | null,
    template: GameTemplate | null,
    config: CreationConfig,
    userPrompt: string
  ): string {
    let prompt = '';

    // Add category-specific system prompt if available
    if (category?.system_prompt) {
      prompt += `${category.system_prompt}\n\n`;
    }

    // Add template example code as Few-Shot Learning
    if (template?.example_code) {
      prompt += `Here's an example of a ${template.name} game:\n\n`;
      prompt += `<example>\n${template.example_code}\n</example>\n\n`;
      prompt += `Create a similar game based on the following requirements:\n\n`;
    }

    // Add category few-shot examples if available
    if (category?.metadata?.fewShotExamples && Array.isArray(category.metadata.fewShotExamples)) {
      const examples = category.metadata.fewShotExamples;
      if (examples.length > 0) {
        prompt += `Here are ${examples.length} additional complete card game examples to learn from:\n\n`;
        examples.forEach((example: string, index: number) => {
          prompt += `EXAMPLE ${index + 1}:\n${example}\n\n`;
        });
        prompt += `Study these examples carefully. Notice:\n`;
        prompt += `- Complete HTML structure with DOCTYPE, html, head, body tags\n`;
        prompt += `- All CSS in <style> tags\n`;
        prompt += `- All JavaScript in <script> tags\n`;
        prompt += `- Fully functional game logic\n`;
        prompt += `- Clear visual design\n`;
        prompt += `- Interactive elements with event handlers\n\n`;
      }
    }

    // Add category-specific constraints and best practices
    if (category?.metadata) {
      const metadata = category.metadata;
      
      if (metadata.constraints && metadata.constraints.length > 0) {
        prompt += `Constraints:\n`;
        metadata.constraints.forEach(constraint => {
          prompt += `- ${constraint}\n`;
        });
        prompt += `\n`;
      }

      if (metadata.best_practices && metadata.best_practices.length > 0) {
        prompt += `Best Practices:\n`;
        metadata.best_practices.forEach(practice => {
          prompt += `- ${practice}\n`;
        });
        prompt += `\n`;
      }

      // Add category-specific mechanics
      if (metadata.mechanics && metadata.mechanics.length > 0) {
        prompt += `Game Mechanics:\n`;
        metadata.mechanics.forEach(mechanic => {
          prompt += `- ${mechanic}\n`;
        });
        prompt += `\n`;
      }

      // Add card game specific configuration
      if (config.mechanics && config.mechanics.length > 0) {
        prompt += `Selected Mechanics:\n`;
        config.mechanics.forEach(mechanic => {
          prompt += `- ${mechanic}\n`;
        });
        prompt += `\n`;
      }
    }

    // Add template-specific configuration
    if (template?.config) {
      if (template.config.theme) {
        prompt += `Theme: ${template.config.theme}\n\n`;
      }
      if (template.config.features && template.config.features.length > 0) {
        prompt += `Features to include:\n`;
        template.config.features.forEach(feature => {
          prompt += `- ${feature}\n`;
        });
        prompt += `\n`;
      }
    }

    // Add user's custom prompt
    if (userPrompt) {
      prompt += `User Requirements:\n${userPrompt}\n\n`;
    }

    // Add final instructions
    prompt += `\nInstructions:\n`;
    prompt += `- Generate a complete, playable HTML game\n`;
    prompt += `- Include all necessary HTML, CSS, and JavaScript in a single file\n`;
    prompt += `- Ensure the game is fully functional and interactive\n`;
    prompt += `- Add clear instructions for the player\n`;
    prompt += `- Use a fun, colorful visual style\n`;
    prompt += `- Make sure the game is responsive and works on different screen sizes\n`;

    return prompt;
  }

  /**
   * Build prompt without category/template (backward compatible)
   */
  static buildSimplePrompt(userPrompt: string): string {
    return `Create a complete, playable HTML game based on the following description:\n\n${userPrompt}\n\n` +
      `Requirements:\n` +
      `- Generate a complete HTML file with embedded CSS and JavaScript\n` +
      `- The game should be fully playable and interactive\n` +
      `- Include clear instructions for the player\n` +
      `- Use a fun, colorful visual style\n` +
      `- Make sure the game is responsive\n`;
  }
}
