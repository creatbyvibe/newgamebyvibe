import { Button } from "@/components/ui/button";
import TemplateCard from "@/components/TemplateCard";
import StepCard from "@/components/StepCard";
import FloatingEmoji from "@/components/FloatingEmoji";
import { 
  Gamepad2, 
  Dices, 
  Music, 
  Palette, 
  Timer, 
  MessageCircle,
  Sparkles,
  Zap,
  Heart
} from "lucide-react";

const templates = [
  {
    title: "弹球小游戏",
    description: "经典的弹球游戏，用键盘控制挡板，看看能得多少分！",
    icon: Gamepad2,
    color: "orange" as const,
  },
  {
    title: "骰子决定器",
    description: "不知道吃什么？让骰子帮你决定！支持自定义选项。",
    icon: Dices,
    color: "yellow" as const,
  },
  {
    title: "节拍器",
    description: "练琴、练舞必备的节拍器，支持多种节奏型。",
    icon: Music,
    color: "mint" as const,
  },
  {
    title: "表情包生成器",
    description: "上传图片，添加文字，一键生成你的专属表情包！",
    icon: Palette,
    color: "pink" as const,
  },
  {
    title: "番茄钟",
    description: "25分钟专注 + 5分钟休息，帮你高效学习工作。",
    icon: Timer,
    color: "blue" as const,
  },
  {
    title: "匿名聊天室",
    description: "和朋友创建一个临时聊天室，聊完即焚！",
    icon: MessageCircle,
    color: "orange" as const,
  },
];

const steps = [
  {
    number: 1,
    title: "描述想法",
    description: "用自然语言告诉 AI 你想做什么",
    emoji: "💭",
  },
  {
    number: 2,
    title: "AI 创作",
    description: "看着代码自动生成，见证魔法时刻",
    emoji: "✨",
  },
  {
    number: 3,
    title: "玩起来！",
    description: "立即体验你的作品，分享给朋友",
    emoji: "🎮",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Floating emojis */}
        <FloatingEmoji emoji="🎮" className="top-20 left-[10%]" delay={0} />
        <FloatingEmoji emoji="🎨" className="top-32 right-[15%]" delay={500} />
        <FloatingEmoji emoji="🎲" className="bottom-40 left-[20%]" delay={1000} />
        <FloatingEmoji emoji="🎵" className="bottom-32 right-[10%]" delay={1500} />
        <FloatingEmoji emoji="⭐" className="top-40 left-[30%]" delay={800} />
        <FloatingEmoji emoji="🚀" className="bottom-48 right-[25%]" delay={300} />
        
        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-card mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">VibeCoding 让编程变有趣</span>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            用
            <span className="text-gradient-fun"> 快乐 </span>
            编程
            <br />
            <span className="text-gradient-fun">玩</span>出你的创意
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            告诉 AI 你的想法，几分钟内创造出有趣的小游戏、小工具。
            <br />
            无需编程经验，只需要你的创意！
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button variant="fun" size="xl" className="group">
              <Zap className="w-6 h-6 group-hover:animate-wiggle" />
              开始创作
            </Button>
            <Button variant="playful" size="lg">
              浏览模板库
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">创作者</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50k+</div>
              <div className="text-sm text-muted-foreground">小项目</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-highlight">∞</div>
              <div className="text-sm text-muted-foreground">可能性</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </div>
        </div>
      </section>
      
      {/* Templates Section */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              从模板开始，<span className="text-gradient-fun">秒变创作者</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              选择一个模板作为起点，或者直接描述你的想法，让 AI 帮你实现
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <TemplateCard
                key={template.title}
                {...template}
                delay={index * 100}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              查看全部 100+ 模板
            </Button>
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              简单<span className="text-gradient-fun"> 3 步</span>，创意变现实
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <StepCard key={step.number} {...step} delay={index * 150} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative gradient-fun rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-5xl opacity-50">🎮</div>
            <div className="absolute bottom-4 right-4 text-5xl opacity-50">🎨</div>
            <div className="absolute top-1/2 right-8 text-4xl opacity-30">✨</div>
            
            <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-4 relative z-10">
              准备好开始你的创作之旅了吗？
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto relative z-10">
              加入数万创作者，用 VibeCoding 把你的有趣想法变成现实
            </p>
            <Button variant="playful" size="xl" className="relative z-10 bg-card hover:bg-card">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-foreground">免费开始创作</span>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <span className="font-bold text-foreground">VibeCoding</span>
          </div>
          <p className="text-sm text-muted-foreground">
            让每个人都能成为创作者 ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;