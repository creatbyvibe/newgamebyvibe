import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameCategorySelector } from './GameCategorySelector';
import { TemplatePreview } from './TemplatePreview';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { GameCategory, GameTemplate, CreationConfig } from '@/types/game';
import { cn } from '@/lib/utils';

interface GuidedCreationWizardProps {
  onComplete: (config: {
    categoryId?: string;
    templateId?: string;
    config: CreationConfig;
    prompt: string;
  }) => void;
  onCancel?: () => void;
}

type WizardStep = 'category' | 'template' | 'config' | 'review';

const STEP_LABELS: Record<WizardStep, string> = {
  category: '选择类别',
  template: '选择模板',
  config: '配置参数',
  review: '预览配置',
};

export const GuidedCreationWizard = ({
  onComplete,
  onCancel,
}: GuidedCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [config, setConfig] = useState<CreationConfig>({
    difficulty: 'intermediate',
    theme: '',
  });
  const [customPrompt, setCustomPrompt] = useState('');

  const steps: WizardStep[] = ['category', 'template', 'config', 'review'];

  const currentStepIndex = steps.indexOf(currentStep);

  const canGoNext = () => {
    switch (currentStep) {
      case 'category':
        return true; // Category is optional
      case 'template':
        return true; // Template is optional
      case 'config':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return currentStepIndex > 0;
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleComplete = () => {
    onComplete({
      categoryId: selectedCategory?.id,
      templateId: selectedTemplate?.id,
      config: {
        ...config,
        difficulty: selectedTemplate?.difficulty || config.difficulty,
      },
      prompt: customPrompt || `创建一个${selectedCategory?.name || '有趣的'}游戏`,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'category':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>步骤 1: 选择游戏类别</CardTitle>
                <CardDescription>
                  选择一个游戏类别可以帮助AI生成更符合预期的游戏。你也可以跳过此步骤。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GameCategorySelector
                  selectedCategoryId={selectedCategory?.id}
                  onSelect={setSelectedCategory}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>步骤 2: 选择模板（可选）</CardTitle>
                <CardDescription>
                  选择一个模板可以基于已有的游戏示例进行生成，提高成功率。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCategory ? (
                  <TemplatePreview
                    categoryId={selectedCategory.id}
                    selectedTemplateId={selectedTemplate?.id}
                    onSelect={setSelectedTemplate}
                  />
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>请先选择游戏类别，或返回上一步</p>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('category')}
                      className="mt-4"
                    >
                      返回选择类别
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>步骤 3: 配置参数</CardTitle>
                <CardDescription>
                  设置游戏的基本参数和自定义提示词
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">难度级别</label>
                  <div className="flex gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={config.difficulty === difficulty ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig({ ...config, difficulty })}
                      >
                        {difficulty === 'beginner' && '初级'}
                        {difficulty === 'intermediate' && '中级'}
                        {difficulty === 'advanced' && '高级'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">主题（可选）</label>
                  <input
                    type="text"
                    value={config.theme || ''}
                    onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                    placeholder="例如：科幻、奇幻、现代等"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">自定义提示词（可选）</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="描述你想要的游戏特点..."
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-background resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>步骤 4: 预览配置</CardTitle>
                <CardDescription>
                  确认你的配置，然后开始生成游戏
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">游戏类别：</span>
                    <span className="font-medium">
                      {selectedCategory?.name || '未选择（自由创作）'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">模板：</span>
                    <span className="font-medium">
                      {selectedTemplate?.name || '未选择'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">难度：</span>
                    <span className="font-medium">
                      {config.difficulty === 'beginner' && '初级'}
                      {config.difficulty === 'intermediate' && '中级'}
                      {config.difficulty === 'advanced' && '高级'}
                    </span>
                  </div>
                  {config.theme && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">主题：</span>
                      <span className="font-medium">{config.theme}</span>
                    </div>
                  )}
                  {customPrompt && (
                    <div>
                      <span className="text-muted-foreground">自定义提示词：</span>
                      <p className="mt-1 text-sm">{customPrompt}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    index < currentStepIndex
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStepIndex
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                  )}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-center text-muted-foreground">
                  {STEP_LABELS[step]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-colors',
                    index < currentStepIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {canGoBack() && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="ml-2">
              取消
            </Button>
          )}
        </div>
        <Button onClick={handleNext} disabled={!canGoNext()}>
          {currentStepIndex === steps.length - 1 ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              开始生成
            </>
          ) : (
            <>
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
