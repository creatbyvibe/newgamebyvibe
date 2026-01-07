import { Button } from '@/components/ui/button';
import { Palette, Gamepad2, Wrench, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AISkillsProps {
  onSelectSkill: (prompt: string) => void;
  disabled?: boolean;
}

const skillCategories = [
  {
    name: "视觉",
    icon: Palette,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
    skills: [
      { label: "添加动画", prompt: "Add smooth CSS animations and transitions to make interactions more engaging and fluid" },
      { label: "改配色", prompt: "Improve the color scheme with a modern, cohesive palette that looks more professional" },
      { label: "响应式", prompt: "Make the layout fully responsive for mobile devices and tablets" },
      { label: "加阴影", prompt: "Add subtle shadows and depth to elements for a more polished look" },
    ]
  },
  {
    name: "游戏",
    icon: Gamepad2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    skills: [
      { label: "加分数", prompt: "Add a visible score counter that increases when the player achieves goals" },
      { label: "加音效", prompt: "Add sound effects for key interactions using Web Audio API" },
      { label: "加难度", prompt: "Implement progressive difficulty that increases as the player advances" },
      { label: "加粒子", prompt: "Add particle effects for explosions, collections, or celebrations" },
    ]
  },
  {
    name: "修复",
    icon: Wrench,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    skills: [
      { label: "修 Bug", prompt: "Review the code and fix any potential bugs, errors, or issues" },
      { label: "优化性能", prompt: "Optimize performance by improving code efficiency and reducing lag" },
      { label: "加注释", prompt: "Add helpful comments throughout the code explaining what each part does" },
    ]
  },
  {
    name: "扩展",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    skills: [
      { label: "存档功能", prompt: "Add save/load functionality so progress can be preserved between sessions" },
      { label: "暂停菜单", prompt: "Add a pause menu with resume, restart, and settings options" },
      { label: "成就系统", prompt: "Add an achievements/badges system to reward and motivate players" },
    ]
  }
];

const AISkills = ({ onSelectSkill, disabled }: AISkillsProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName);
  };

  return (
    <div className="space-y-2">
      {/* Category buttons */}
      <div className="flex flex-wrap gap-2">
        {skillCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.name;
          
          return (
            <Button
              key={category.name}
              variant="ghost"
              size="sm"
              onClick={() => toggleCategory(category.name)}
              disabled={disabled}
              className={`${category.bgColor} ${category.color} gap-1.5 text-xs font-medium`}
            >
              <Icon className="w-3.5 h-3.5" />
              {category.name}
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Expanded skills */}
      {expandedCategory && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-lg animate-fade-in">
          {skillCategories
            .find(c => c.name === expandedCategory)
            ?.skills.map((skill) => (
              <Button
                key={skill.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectSkill(skill.prompt);
                  setExpandedCategory(null);
                }}
                disabled={disabled}
                className="text-xs h-7 hover:bg-primary hover:text-primary-foreground"
              >
                {skill.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
};

export default AISkills;
